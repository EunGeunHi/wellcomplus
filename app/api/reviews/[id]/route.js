import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 이미지 파일 검증 함수
 */
function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('JPG, PNG 파일만 업로드 가능합니다.');
  }

  if (file.size > maxSize) {
    throw new Error('개별 파일 크기는 10MB를 초과할 수 없습니다.');
  }

  return true;
}

/**
 * 파일을 Buffer로 변환하는 함수
 */
async function fileToBuffer(file) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * 리뷰 수정 API (PATCH)
 * 인증된 사용자만 접근 가능
 */
export const PATCH = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    // Content-Type 확인
    const contentType = req.headers.get('content-type');

    let content,
      rating,
      serviceType,
      images = [];
    let keepExistingImages = true;
    let imagesToDelete = []; // 삭제할 이미지 ID들을 저장할 변수

    if (contentType?.includes('multipart/form-data')) {
      // FormData로 이미지와 함께 전송된 경우
      const formData = await req.formData();

      content = formData.get('content');
      rating = parseInt(formData.get('rating'));
      serviceType = formData.get('serviceType');
      keepExistingImages = formData.get('keepExistingImages') === 'true';

      // 삭제할 이미지 ID들 추출 (실제 처리는 review 조회 후)
      imagesToDelete = formData.getAll('imagesToDelete');

      // 새로운 이미지 파일 처리
      const imageFiles = formData.getAll('images');

      if (imageFiles && imageFiles.length > 0) {
        // 이미지 개수 검증
        if (imageFiles.length > 5) {
          return NextResponse.json(
            { error: '이미지는 최대 5장까지만 업로드 가능합니다.' },
            { status: 400 }
          );
        }

        let totalSize = 0;

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];

          // 파일이 실제로 업로드된 것인지 확인
          if (file.size === 0) continue;

          try {
            // 개별 파일 검증
            validateImage(file);
            totalSize += file.size;

            // 파일을 Buffer로 변환
            const buffer = await fileToBuffer(file);

            images.push({
              filename: `${Date.now()}_${i}_${file.name}`,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              data: buffer,
            });
          } catch (error) {
            return NextResponse.json(
              { error: `이미지 ${i + 1}: ${error.message}` },
              { status: 400 }
            );
          }
        }

        // 총 파일 크기 검증
        if (totalSize > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: '이미지 총 크기는 10MB를 초과할 수 없습니다.' },
            { status: 400 }
          );
        }
      }
    } else {
      // JSON으로 텍스트만 전송된 경우 (기존 로직 유지)
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

    // 리뷰 업데이트
    review.content = content;
    review.rating = rating;
    review.serviceType = serviceType;

    // 이미지 처리 (review 조회 후 실행)
    if (contentType?.includes('multipart/form-data')) {
      // 기존 이미지에서 삭제할 이미지들 제거
      if (imagesToDelete && imagesToDelete.length > 0) {
        // MongoDB ObjectId는 문자열로 비교해야 함
        const filteredExistingImages =
          review.images?.filter((img) => !imagesToDelete.includes(img._id.toString())) || [];

        // 기존 이미지 업데이트
        review.images = filteredExistingImages;
      }

      // 새로운 이미지 추가
      if (images.length > 0) {
        if (keepExistingImages) {
          // 기존 이미지 유지하면서 새 이미지 추가
          const totalImages = [...(review.images || []), ...images];
          if (totalImages.length > 5) {
            return NextResponse.json(
              { error: '기존 이미지와 새 이미지를 합쳐서 최대 5장까지만 가능합니다.' },
              { status: 400 }
            );
          }
          review.images = totalImages;
        } else {
          // 기존 이미지 모두 삭제하고 새 이미지로 교체
          review.images = images;
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
        images: review.images
          ? review.images.map((img) => ({
              id: img._id,
              filename: img.filename,
              originalName: img.originalName,
              mimeType: img.mimeType,
              size: img.size,
            }))
          : [],
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
