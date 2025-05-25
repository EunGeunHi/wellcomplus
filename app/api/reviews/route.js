import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/review';
import { withAuthAPI, withKingAuthAPI } from '@/app/api/middleware';
import { uploadImageToBlob, validateImage, validateImageCount } from '@/lib/blob-storage';

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

    // MongoDB 연결
    await connectDB();

    // 임시 리뷰 생성 (이미지 없이)
    const tempReview = new Review({
      serviceType,
      rating,
      content,
      userId: session.user.id,
      status: 'register',
      images: [], // 빈 배열로 시작
    });

    // 임시 저장하여 리뷰 ID 생성
    await tempReview.save();
    const reviewId = tempReview._id.toString();

    // 이미지 파일 처리
    const images = [];
    const imageFiles = formData.getAll('images');

    if (imageFiles && imageFiles.length > 0) {
      // 실제 파일만 필터링 (빈 파일 제외)
      const validFiles = imageFiles.filter((file) => file.size > 0);

      if (validFiles.length > 0) {
        try {
          // 이미지 검증
          validateImageCount(validFiles);

          // 각 파일 개별 검증 및 업로드
          for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];

            // 개별 파일 검증
            validateImage(file);

            // Vercel Blob Storage에 업로드
            const uploadedImage = await uploadImageToBlob(file, reviewId, i);
            images.push(uploadedImage);
          }
        } catch (error) {
          // 업로드 실패 시 임시 리뷰 삭제
          await Review.findByIdAndDelete(reviewId);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
    }

    // 리뷰에 이미지 정보 업데이트
    tempReview.images = images;
    await tempReview.save();

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 등록되었습니다.',
      review: {
        id: tempReview._id,
        serviceType: tempReview.serviceType,
        rating: tempReview.rating,
        content: tempReview.content,
        createdAt: tempReview.createdAt,
        images: tempReview.images.map((img) => ({
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
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit)
      .lean(); // 성능 최적화

    // Get total count for pagination info
    const totalCount = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // 이미지 정보 최적화 (URL은 이미 포함되어 있음)
    const optimizedReviews = reviews.map((review) => {
      if (review.images && review.images.length > 0) {
        review.images = review.images.map((image) => ({
          id: image._id,
          url: image.url, // Vercel Blob Storage URL
          originalName: image.originalName,
          mimeType: image.mimeType,
          size: image.size,
          uploadedAt: image.uploadedAt,
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
