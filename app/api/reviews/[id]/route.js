import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';
import {
  uploadImageToBlob,
  deleteImageFromBlob,
  validateImage,
  validateImageCount,
} from '@/lib/blob-storage';

/**
 * 리뷰 수정 API (PATCH)
 * 인증된 사용자만 접근 가능
 */
export const PATCH = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    // Content-Type 확인
    const contentType = req.headers.get('content-type');

    let content, rating, serviceType;
    let newImages = [];
    let keepExistingImages = true;
    let imagesToDelete = [];

    if (contentType?.includes('multipart/form-data')) {
      // FormData로 이미지와 함께 전송된 경우
      const formData = await req.formData();

      content = formData.get('content');
      rating = parseInt(formData.get('rating'));
      serviceType = formData.get('serviceType');
      keepExistingImages = formData.get('keepExistingImages') === 'true';

      // 삭제할 이미지 ID들 추출
      imagesToDelete = formData.getAll('imagesToDelete');

      // 새로운 이미지 파일 처리
      const imageFiles = formData.getAll('images');

      if (imageFiles && imageFiles.length > 0) {
        // 실제 파일만 필터링 (빈 파일 제외)
        const validFiles = imageFiles.filter((file) => file.size > 0);

        if (validFiles.length > 0) {
          // 이미지 검증
          validateImageCount(validFiles);

          // 각 파일 개별 검증 (업로드는 나중에)
          for (const file of validFiles) {
            validateImage(file);
          }

          // 임시로 파일들을 저장 (실제 업로드는 리뷰 조회 후)
          newImages = validFiles;
        }
      }
    } else {
      // JSON으로 텍스트만 전송된 경우
      const body = await req.json();
      content = body.content;
      rating = body.rating;
      serviceType = body.serviceType;
    }

    // 필수 필드 검증
    if (!content || !rating || !serviceType) {
      return NextResponse.json(
        { error: '서비스 유형, 별점, 리뷰 내용은 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    // 리뷰 내용 길이 검증
    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: '리뷰 내용은 최소 10자 이상 작성해야 합니다.' },
        { status: 400 }
      );
    }

    // 별점 범위 검증
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '별점은 1점에서 5점 사이로 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // MongoDB 연결
    await connectDB();

    // 리뷰 조회
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 리뷰 작성자와 현재 사용자가 일치하는지 확인
    if (review.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: '본인이 작성한 리뷰만 수정할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 기본 필드 업데이트
    review.content = content;
    review.rating = rating;
    review.serviceType = serviceType;

    // 이미지 처리
    if (contentType?.includes('multipart/form-data')) {
      // 삭제할 이미지들을 Blob Storage에서 삭제
      const imagesToDeleteFromBlob = [];
      if (imagesToDelete && imagesToDelete.length > 0) {
        review.images.forEach((image) => {
          if (imagesToDelete.includes(image._id.toString())) {
            imagesToDeleteFromBlob.push(image);
          }
        });

        // Blob Storage에서 이미지 삭제
        if (imagesToDeleteFromBlob.length > 0) {
          try {
            for (const image of imagesToDeleteFromBlob) {
              await deleteImageFromBlob(image.url);
            }
          } catch (error) {
            console.error('Blob Storage 이미지 삭제 실패:', error);
            // 삭제 실패해도 계속 진행
          }
        }

        // MongoDB에서 이미지 제거
        review.images = review.images.filter((img) => !imagesToDelete.includes(img._id.toString()));
      }

      // 새로운 이미지 업로드
      const uploadedImages = [];
      if (newImages.length > 0) {
        try {
          for (let i = 0; i < newImages.length; i++) {
            const file = newImages[i];
            const uploadedImage = await uploadImageToBlob(file, id, i);
            uploadedImages.push(uploadedImage);
          }
        } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (keepExistingImages) {
          // 기존 이미지 유지하면서 새 이미지 추가
          const totalImages = [...review.images, ...uploadedImages];
          if (totalImages.length > 5) {
            // 업로드된 새 이미지들을 Blob Storage에서 삭제
            for (const image of uploadedImages) {
              try {
                await deleteImageFromBlob(image.url);
              } catch (error) {
                console.error('새 이미지 롤백 실패:', error);
              }
            }
            return NextResponse.json(
              { error: '기존 이미지와 새 이미지를 합쳐서 최대 5장까지만 가능합니다.' },
              { status: 400 }
            );
          }
          review.images = totalImages;
        } else {
          // 기존 이미지 모두 삭제하고 새 이미지로 교체
          const oldImages = [...review.images];
          review.images = uploadedImages;

          // 기존 이미지들을 Blob Storage에서 삭제
          for (const image of oldImages) {
            try {
              await deleteImageFromBlob(image.url);
            } catch (error) {
              console.error('기존 이미지 삭제 실패:', error);
            }
          }
        }
      }
    }

    // 상태를 'register'로 다시 변경 (관리자 검토를 위해)
    review.status = 'register';

    await review.save();

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 수정되었습니다.',
      review: {
        id: review._id,
        serviceType: review.serviceType,
        rating: review.rating,
        content: review.content,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        images: review.images.map((img) => ({
          id: img._id,
          url: img.url,
          filename: img.filename,
          originalName: img.originalName,
          mimeType: img.mimeType,
          size: img.size,
          uploadedAt: img.uploadedAt,
        })),
      },
    });
  } catch (error) {
    console.error('리뷰 수정 중 오류 발생:', error);

    // Mongoose 검증 오류 처리
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
