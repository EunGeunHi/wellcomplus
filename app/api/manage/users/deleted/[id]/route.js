import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
import Review from '@/models/review';
import { withKingAuthAPI } from '@/app/api/middleware';

// 관리자용 탈퇴 사용자 상세 정보 조회 API
export const GET = withKingAuthAPI(async (req, { params, session }) => {
  const { id } = params;

  try {
    await connectDB();

    // 탈퇴한 사용자 기본 정보 조회
    const user = await User.findOne({ _id: id, isDeleted: true })
      .select('name email phoneNumber authority createdAt updatedAt image provider lastLoginAt')
      .lean();

    if (!user) {
      return NextResponse.json({ error: '탈퇴한 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자의 서비스 신청 내역 조회 (상세 정보 포함)
    const services = await Application.find({ userId: id })
      .sort({ createdAt: -1 })
      .select('type status createdAt updatedAt information comment files')
      .lean();

    // 사용자의 리뷰 내역 조회 (상세 정보 포함) - 탈퇴해도 리뷰는 유지됨
    const reviews = await Review.find({
      userId: id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select('serviceType rating content status createdAt updatedAt images')
      .lean();

    // 서비스 신청 내역 가공
    const processedServices = services.map((service) => ({
      id: service._id,
      type: service.type,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      content: service.information || service.comment || '',
      files: service.files
        ? service.files.map((file) => ({
            id: file._id,
            originalName: file.originalName,
            size: file.size,
            mimeType: file.mimeType,
            url: file.url,
          }))
        : [],
    }));

    // 리뷰 내역 가공
    const processedReviews = reviews.map((review) => ({
      id: review._id,
      serviceType: review.serviceType,
      rating: review.rating,
      content: review.content,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      imageCount: review.images ? review.images.length : 0,
      images: review.images
        ? review.images.map((image) => ({
            id: image._id,
            originalName: image.originalName,
            url: image.url,
          }))
        : [],
    }));

    // 통계 계산
    const stats = {
      totalServices: services.length,
      totalReviews: reviews.length,
      servicesByStatus: {
        apply: services.filter((s) => s.status === 'apply').length,
        in_progress: services.filter((s) => s.status === 'in_progress').length,
        completed: services.filter((s) => s.status === 'completed').length,
        cancelled: services.filter((s) => s.status === 'cancelled').length,
      },
      reviewsByStatus: {
        register: reviews.filter((r) => r.status === 'register').length,
        active: reviews.filter((r) => r.status === 'active').length,
        hidden: reviews.filter((r) => r.status === 'hidden').length,
      },
      averageRating:
        reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : 0,
      firstServiceDate: services.length > 0 ? services[services.length - 1].createdAt : null,
      lastServiceDate: services.length > 0 ? services[0].createdAt : null,
      firstReviewDate: reviews.length > 0 ? reviews[reviews.length - 1].createdAt : null,
      lastReviewDate: reviews.length > 0 ? reviews[0].createdAt : null,
      deletedAt: user.updatedAt, // 탈퇴일
    };

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        provider: user.provider || 'credentials',
        deletedAt: user.updatedAt,
      },
      services: processedServices,
      reviews: processedReviews,
      stats,
    });
  } catch (error) {
    console.error('탈퇴 사용자 상세 정보 조회 중 오류:', error);
    return NextResponse.json(
      { error: '탈퇴 사용자 상세 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
});
