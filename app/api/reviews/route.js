import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI, withKingAuthAPI } from '@/app/api/middleware';

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
 * 리뷰 등록 API (POST)
 * 인증된 사용자만 접근 가능
 */
export const POST = withAuthAPI(async (req, { session }) => {
  try {
    const formData = await req.formData();

    // 기본 필드 추출
    const serviceType = formData.get('serviceType');
    const rating = parseInt(formData.get('rating'));
    const content = formData.get('content');

    // 필수 필드 검증
    if (!serviceType || !rating || !content) {
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

    // 이미지 파일 처리
    const images = [];
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
          return NextResponse.json({ error: `이미지 ${i + 1}: ${error.message}` }, { status: 400 });
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

    // MongoDB 연결
    await connectDB();

    // 리뷰 생성
    const newReview = new Review({
      serviceType,
      rating,
      content,
      userId: session.user.id, // 인증된 사용자 ID
      status: 'register', // 초기 상태: 등록됨
      images: images, // 이미지 배열 추가
    });

    // 리뷰 저장
    await newReview.save();

    // 성공 응답 (이미지 데이터는 제외하고 메타정보만 반환)
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 등록되었습니다.',
      review: {
        id: newReview._id,
        serviceType: newReview.serviceType,
        rating: newReview.rating,
        content: newReview.content,
        createdAt: newReview.createdAt,
        images: newReview.images.map((img) => ({
          id: img._id,
          filename: img.filename,
          originalName: img.originalName,
          mimeType: img.mimeType,
          size: img.size,
        })),
      },
    });
  } catch (error) {
    console.error('리뷰 등록 중 오류 발생:', error);

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

async function handler(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    // Get query parameters
    const status = searchParams.get('status') || 'register';
    const search = searchParams.get('search') || '';
    const serviceType = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // 기본 20개로 제한

    // Build the query
    const query = { status };

    // Add service type filter if provided
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Add search functionality if provided
    if (search) {
      query['$or'] = [{ content: { $regex: search, $options: 'i' } }];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch reviews with optimized query
    const reviews = await Review.find(query)
      .populate('userId', 'name email') // Populate user data
      .select('-images.data') // 이미지 바이너리 데이터 제외
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit)
      .lean(); // 성능 최적화

    // Get total count for pagination info
    const totalCount = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // 이미지 메타데이터만 포함하도록 최적화
    const optimizedReviews = reviews.map((review) => {
      if (review.images && review.images.length > 0) {
        review.images = review.images.map((image) => ({
          id: image._id,
          originalName: image.originalName,
          mimeType: image.mimeType,
          size: image.size,
          // 이미지 조회를 위한 URL 엔드포인트
          url: `/api/reviews/images/${review._id}/${image._id}`,
        }));
      }
      return review;
    });

    return NextResponse.json({
      reviews: optimizedReviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withKingAuthAPI(handler);
