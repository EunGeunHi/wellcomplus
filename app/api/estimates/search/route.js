import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import { withKingAuthAPI } from '@/app/api/middleware';

export const GET = withKingAuthAPI(async (req, { session }) => {
  // 관리자(king) 권한이 없으면 접근 불가
  if (session.user.authority !== 'king') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || '';
    const searchType = searchParams.get('searchType') || 'all';
    const estimateType = searchParams.get('estimateType') || '';
    const contractorStatus = searchParams.get('contractorStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    await connectDB();

    // 검색 조건 설정
    let query = {};

    // 견적 타입 필터링
    if (estimateType) {
      query.estimateType = estimateType;
    }

    // 계약자 상태 필터링
    if (contractorStatus === 'true') {
      query.isContractor = true;
    } else if (contractorStatus === 'false') {
      query.isContractor = false;
    }

    if (keyword) {
      let keywordQuery;

      if (searchType === 'all') {
        // 전체 검색 - 여러 필드에서 검색
        keywordQuery = {
          $or: [
            { 'customerInfo.name': { $regex: keyword, $options: 'i' } },
            { 'customerInfo.phone': { $regex: keyword, $options: 'i' } },
            { 'customerInfo.pcNumber': { $regex: keyword, $options: 'i' } },
            { 'customerInfo.contractType': { $regex: keyword, $options: 'i' } },
            { 'customerInfo.content': { $regex: keyword, $options: 'i' } },
          ],
        };
      } else if (searchType === 'name') {
        keywordQuery = { 'customerInfo.name': { $regex: keyword, $options: 'i' } };
      } else if (searchType === 'phone') {
        keywordQuery = { 'customerInfo.phone': { $regex: keyword, $options: 'i' } };
      } else if (searchType === 'pcNumber') {
        keywordQuery = { 'customerInfo.pcNumber': { $regex: keyword, $options: 'i' } };
      } else if (searchType === 'contractType') {
        keywordQuery = { 'customerInfo.contractType': { $regex: keyword, $options: 'i' } };
      } else if (searchType === 'content') {
        keywordQuery = { 'customerInfo.content': { $regex: keyword, $options: 'i' } };
      }

      // 견적 타입과 키워드 검색 조건을 함께 적용
      if (Object.keys(query).length > 0) {
        query = { $and: [query, keywordQuery] };
      } else {
        query = keywordQuery;
      }
    }

    // 필요한 필드 선택 - 목록에 보여줄 데이터만 선택하여 DB 부하 감소
    const projection = {
      'customerInfo.name': 1,
      'customerInfo.phone': 1,
      'customerInfo.pcNumber': 1, // 식별을 위해 추가
      estimateType: 1, // 견적 타입 추가
      isContractor: 1, // 계약자 상태 추가
      createdAt: 1,
      _id: 1, // ID는 항상 필요
    };

    // 병렬로 카운트와 데이터 조회 실행
    const [total, estimates] = await Promise.all([
      // 전체 문서 수 조회 (페이지네이션을 위해)
      Estimate.countDocuments(query).exec(),

      // 필요한 데이터만 가져오기
      Estimate.find(query, projection)
        .sort({ createdAt: -1 }) // 생성일 내림차순 정렬(최신순)
        .skip(skip)
        .limit(limit)
        .lean() // JSON으로 변환 성능 향상
        .exec(),
    ]);

    // 결과 캐싱 힌트 추가
    const response = NextResponse.json({
      estimates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

    // 캐싱 시간 단축 (10초로 설정)
    response.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10');

    return response;
  } catch (error) {
    console.error('견적 검색 중 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
});
