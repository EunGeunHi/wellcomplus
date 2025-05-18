import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Review from '@/models/review';
import { withKingAuthAPI } from '../../middleware';

/**
 * 관리자 대시보드 카운터 정보를 제공하는 API
 * - apply 상태 서비스 신청 수
 * - in_progress 상태 서비스 신청 수
 * - register 상태 리뷰 수
 */
async function handler(req) {
  try {
    await connectDB();

    // 1. 'apply' 상태 서비스 신청 수 조회
    const applyCount = await Application.countDocuments({ status: 'apply' });

    // 2. 'in_progress' 상태 서비스 신청 수 조회
    const inProgressCount = await Application.countDocuments({ status: 'in_progress' });

    // 3. 'register' 상태 리뷰 수 조회
    const registerReviewCount = await Review.countDocuments({ status: 'register' });

    return NextResponse.json({
      applyCount,
      inProgressCount,
      registerReviewCount,
    });
  } catch (error) {
    console.error('대시보드 카운터 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

export const GET = withKingAuthAPI(handler);
