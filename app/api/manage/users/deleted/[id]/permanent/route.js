import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
import Review from '@/models/review';
import { withKingAuthAPI } from '@/app/api/middleware';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary 이미지 삭제 함수
const deleteCloudinaryImages = async (images) => {
  if (!images || images.length === 0) return;

  const deletePromises = images.map(async (image) => {
    try {
      if (image.cloudinaryId) {
        await cloudinary.uploader.destroy(image.cloudinaryId);
      }
    } catch (error) {
      console.error(`Cloudinary 이미지 삭제 실패: ${image.cloudinaryId}`, error);
      // 이미지 삭제 실패는 로그만 남기고 계속 진행
    }
  });

  await Promise.all(deletePromises);
};

// 관리자용 탈퇴 사용자 완전 삭제 API
export const DELETE = withKingAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    await connectDB();

    // 1. 삭제할 사용자가 실제로 탈퇴한 사용자인지 확인
    const user = await User.findOne({ _id: id, isDeleted: true });
    if (!user) {
      return NextResponse.json({ error: '탈퇴한 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. 사용자의 Application 데이터와 관련 이미지 조회 및 삭제
    const applications = await Application.find({ userId: id });

    // Application의 모든 이미지 수집
    const applicationImages = [];
    applications.forEach((app) => {
      if (app.files && app.files.length > 0) {
        applicationImages.push(...app.files);
      }
    });

    // Application 이미지 삭제
    if (applicationImages.length > 0) {
      await deleteCloudinaryImages(applicationImages);
    }

    // 3. 사용자의 Review 데이터와 관련 이미지 조회 및 삭제
    const reviews = await Review.find({ userId: id });

    // Review의 모든 이미지 수집
    const reviewImages = [];
    reviews.forEach((review) => {
      if (review.images && review.images.length > 0) {
        reviewImages.push(...review.images);
      }
    });

    // Review 이미지 삭제
    if (reviewImages.length > 0) {
      await deleteCloudinaryImages(reviewImages);
    }

    // 4. MongoDB에서 데이터 삭제 (순서 중요: 참조되는 데이터부터 삭제)

    // Application 데이터 삭제
    const deletedApplications = await Application.deleteMany({ userId: id });

    // Review 데이터 삭제
    const deletedReviews = await Review.deleteMany({ userId: id });

    // User 데이터 삭제
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new Error('사용자 삭제 중 오류가 발생했습니다.');
    }

    return NextResponse.json({
      success: true,
      message: '사용자와 관련된 모든 데이터가 완전히 삭제되었습니다.',
      deletedData: {
        user: user.name,
        applications: deletedApplications.deletedCount,
        reviews: deletedReviews.deletedCount,
        applicationImages: applicationImages.length,
        reviewImages: reviewImages.length,
      },
    });
  } catch (error) {
    console.error('사용자 완전 삭제 중 오류:', error);
    return NextResponse.json(
      {
        error: '사용자 삭제 중 오류가 발생했습니다.',
        details: error.message,
      },
      { status: 500 }
    );
  }
});
