import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI } from '@/app/api/middleware';

/**
 * 리뷰 수정 API (PATCH)
 * 인증된 사용자만 접근 가능
 * 클라이언트 업로드 방식 사용
 */
export const PATCH = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    // JSON 데이터 처리 (클라이언트 업로드 방식)
    const body = await req.json();

    const {
      content,
      rating,
      serviceType,
      images = [], // 클라이언트에서 업로드된 새로운 이미지 정보
    } = body;

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

    // 이미지 개수 검증
    if (images && images.length > 5) {
      return NextResponse.json(
        { error: '이미지는 최대 5장까지만 업로드 가능합니다.' },
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

    // 이미지 데이터 검증 및 필수 필드 보장
    const validatedImages = (images || []).map((img, index) => ({
      url: img.url,
      filename: img.filename || `review_${review._id}_${index}_${Date.now()}`,
      originalName: img.originalName || `image_${index + 1}`,
      mimeType: img.mimeType || 'image/jpeg',
      size: img.size || 0,
      blobId: img.blobId || img.url?.split('/').pop() || `blob_${Date.now()}_${index}`,
      uploadedAt: img.uploadedAt || new Date(),
    }));

    // 리뷰 정보 업데이트
    review.content = content;
    review.rating = rating;
    review.serviceType = serviceType;
    review.images = validatedImages; // 검증된 이미지 정보로 교체
    review.status = 'register'; // 관리자 검토를 위해 상태 변경

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

/**
 * 리뷰 삭제 API (DELETE)
 * 인증된 사용자만 접근 가능
 */
export const DELETE = withAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    await connectDB();

    // 리뷰 조회
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 리뷰 작성자와 현재 사용자가 일치하는지 확인
    if (review.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: '본인이 작성한 리뷰만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 소프트 삭제 (isDeleted를 true로 설정)
    review.isDeleted = true;
    review.status = 'deleted';
    await review.save();

    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리뷰 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
