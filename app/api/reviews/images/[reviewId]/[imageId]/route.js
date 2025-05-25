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

    // 리뷰에서 해당 이미지 찾기
    const review = await Review.findOne(
      {
        _id: reviewObjectId,
        'images._id': imageObjectId,
      },
      { 'images.$': 1 }
    ).lean();

    if (!review || !review.images || review.images.length === 0) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    const image = review.images[0];

    // Vercel Blob Storage URL로 리다이렉트
    if (image.url) {
      return NextResponse.redirect(image.url, 302);
    }

    return NextResponse.json({ message: 'Image URL not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { message: 'Failed to fetch image', error: error.message },
      { status: 500 }
    );
  }
}
