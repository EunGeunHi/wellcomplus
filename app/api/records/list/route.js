import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Record from '@/models/Record';
import { withKingAuthAPI } from '../../middleware';

// GET 요청 처리 - 레코드 목록 조회
async function handler(req) {
  try {
    await connectDB();

    // 쿼리 파라미터 추출
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const skip = (page - 1) * limit;

    // 검색 및 필터 쿼리 작성
    const query = {};

    // 제목 검색 조건
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 카테고리 필터 조건
    if (category) {
      query.category = category;
    }

    // 레코드 목록 조회 (파일 데이터 제외)
    const records = await Record.find(query)
      .select('-file.data') // 파일 바이너리 데이터 제외
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip(skip)
      .limit(limit);

    // 전체 레코드 수
    const total = await Record.countDocuments(query);

    return NextResponse.json({
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('레코드 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '레코드 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export const GET = withKingAuthAPI(handler);
