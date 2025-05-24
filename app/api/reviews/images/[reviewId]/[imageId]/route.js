import connectDB from '../../../../../../lib/mongodb';
import Review from '../../../../../../models/review';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// 파일명을 HTTP 헤더용으로 안전하게 인코딩하는 함수
function encodeFilename(filename) {
  if (!filename) return 'image';

  try {
    // ASCII만 포함된 경우 그대로 반환
    if (/^[\x00-\x7F]*$/.test(filename)) {
      return filename;
    }

    // 유니코드 문자가 포함된 경우 RFC 2047 인코딩
    const encoded = Buffer.from(filename, 'utf-8').toString('base64');
    return `=?UTF-8?B?${encoded}?=`;
  } catch (error) {
    console.error('Error encoding filename:', error);
    // 인코딩 실패 시 안전한 기본값 반환
    return 'image';
  }
}

export async function GET(request, { params }) {
  try {
    const { reviewId, imageId } = params;

    if (!reviewId || !imageId) {
      return NextResponse.json({ message: 'Review ID and Image ID are required' }, { status: 400 });
    }

    // ObjectId 유효성 검사 및 변환
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ message: 'Invalid review ID format' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ message: 'Invalid image ID format' }, { status: 400 });
    }

    const reviewObjectId = new mongoose.Types.ObjectId(reviewId);
    const imageObjectId = new mongoose.Types.ObjectId(imageId);

    await connectDB();

    // 특정 리뷰에서 특정 이미지만 조회 (이미지 데이터 포함)
    let review = await Review.findOne(
      {
        _id: reviewObjectId,
        'images._id': imageObjectId,
      },
      { 'images.$': 1 } // 해당 이미지만 반환, 데이터 포함
    ); // lean() 제거 - 이미지 데이터 필요

    // 첫 번째 쿼리 실패 시 전체 리뷰 조회 후 이미지 필터링
    if (!review) {
      const fullReview = await Review.findById(reviewObjectId);
      if (fullReview && fullReview.images) {
        const targetImage = fullReview.images.find(
          (img) => img._id.toString() === imageObjectId.toString()
        );
        if (targetImage) {
          review = {
            _id: fullReview._id,
            images: [targetImage],
          };
        }
      }
    }

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    if (!review.images || review.images.length === 0) {
      return NextResponse.json({ message: 'Images array is empty' }, { status: 404 });
    }

    const image = review.images[0];

    // 이미지 데이터가 없거나 유효하지 않은 경우
    if (!image.data) {
      return NextResponse.json({ message: 'Image data not found' }, { status: 404 });
    }

    // Buffer가 아닌 경우 변환 시도
    let imageBuffer = image.data;
    if (!Buffer.isBuffer(imageBuffer)) {
      try {
        if (typeof imageBuffer === 'string') {
          imageBuffer = Buffer.from(imageBuffer, 'base64');
        } else if (
          imageBuffer &&
          typeof imageBuffer === 'object' &&
          imageBuffer.type === 'Buffer'
        ) {
          imageBuffer = Buffer.from(imageBuffer.data);
        } else {
          throw new Error('알 수 없는 데이터 형식');
        }
      } catch (convertError) {
        return NextResponse.json({ message: 'Invalid image data format' }, { status: 500 });
      }
    }

    // 파일명 안전 인코딩
    const safeFilename = encodeFilename(image.originalName);

    // 이미지 응답 헤더 설정
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // 1년 캐싱
        ETag: `"${imageId}"`,
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(image.originalName || 'image')}`,
        'Access-Control-Allow-Origin': '*', // CORS 문제 해결
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { message: 'Failed to fetch image', error: error.message },
      { status: 500 }
    );
  }
}
