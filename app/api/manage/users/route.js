import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
import Review from '@/models/review';
import { withKingAuthAPI } from '@/app/api/middleware';

// 관리자용 사용자 목록 조회 API
export const GET = withKingAuthAPI(async (req, { session }) => {
  try {
    await connectDB();

    // 모든 사용자 조회 (기본 정보)
    const users = await User.find({})
      .select('name email phoneNumber authority createdAt updatedAt image provider lastLoginAt')
      .sort({ createdAt: -1 })
      .lean();

    // 사용자 ID 목록 추출
    const userIds = users.map((user) => user._id);

    // 각 사용자의 서비스 신청 수 조회
    const serviceStats = await Application.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          serviceCount: { $sum: 1 },
          lastServiceDate: { $max: '$createdAt' },
        },
      },
    ]);

    // 각 사용자의 리뷰 수 조회
    const reviewStats = await Review.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$userId',
          reviewCount: { $sum: 1 },
          lastReviewDate: { $max: '$createdAt' },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    // 서비스 통계를 맵으로 변환
    const serviceStatsMap = {};
    serviceStats.forEach((stat) => {
      serviceStatsMap[stat._id.toString()] = {
        serviceCount: stat.serviceCount,
        lastServiceDate: stat.lastServiceDate,
      };
    });

    // 리뷰 통계를 맵으로 변환
    const reviewStatsMap = {};
    reviewStats.forEach((stat) => {
      reviewStatsMap[stat._id.toString()] = {
        reviewCount: stat.reviewCount,
        lastReviewDate: stat.lastReviewDate,
        averageRating: stat.averageRating,
      };
    });

    // 사용자 데이터에 통계 정보 추가
    const usersWithStats = users.map((user) => {
      const userId = user._id.toString();
      const serviceData = serviceStatsMap[userId] || { serviceCount: 0, lastServiceDate: null };
      const reviewData = reviewStatsMap[userId] || {
        reviewCount: 0,
        lastReviewDate: null,
        averageRating: 0,
      };

      return {
        ...user,
        serviceCount: serviceData.serviceCount,
        lastServiceDate: serviceData.lastServiceDate,
        reviewCount: reviewData.reviewCount,
        lastReviewDate: reviewData.lastReviewDate,
        averageRating: reviewData.averageRating
          ? Math.round(reviewData.averageRating * 10) / 10
          : 0,
        // 가입 방식 정보 (OAuth provider 정보)
        provider: user.provider || 'credentials',
      };
    });

    // 전체 통계 계산
    const totalStats = {
      totalUsers: users.length,
      totalAdmins: users.filter((u) => u.authority === 'king').length,
      totalRegularUsers: users.filter((u) => u.authority === 'user').length,
      totalGuests: users.filter((u) => u.authority === 'guest').length,
      usersWithServices: usersWithStats.filter((u) => u.serviceCount > 0).length,
      usersWithReviews: usersWithStats.filter((u) => u.reviewCount > 0).length,
      totalServices: serviceStats.reduce((sum, stat) => sum + stat.serviceCount, 0),
      totalReviews: reviewStats.reduce((sum, stat) => sum + stat.reviewCount, 0),
    };

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      stats: totalStats,
    });
  } catch (error) {
    console.error('사용자 목록 조회 중 오류:', error);
    return NextResponse.json({ error: '사용자 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
});
