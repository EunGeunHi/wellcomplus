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
      // 검색어를 공백으로 분리하여 각 단어에 대해 검색 조건 생성
      const keywordArray = keyword
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (keywordArray.length > 0) {
        let keywordQueries = [];

        // 각 검색어에 대한 쿼리 생성
        for (const word of keywordArray) {
          let fieldQuery;

          if (searchType === 'all') {
            // 전체 검색 - 여러 필드에서 검색
            fieldQuery = {
              $or: [
                { 'customerInfo.name': { $regex: word, $options: 'i' } },
                { 'customerInfo.phone': { $regex: word, $options: 'i' } },
                { 'customerInfo.pcNumber': { $regex: word, $options: 'i' } },
                { 'customerInfo.contractType': { $regex: word, $options: 'i' } },
                { 'customerInfo.content': { $regex: word, $options: 'i' } },
                // 추가 검색 필드
                { notes: { $regex: word, $options: 'i' } },
                { estimateDescription: { $regex: word, $options: 'i' } },
                { 'tableData.productName': { $regex: word, $options: 'i' } },
                { 'tableData.productCode': { $regex: word, $options: 'i' } },
                { 'tableData.distributor': { $regex: word, $options: 'i' } },
                { 'tableData.reconfirm': { $regex: word, $options: 'i' } },
                { 'tableData.remarks': { $regex: word, $options: 'i' } },
              ],
            };
          } else if (searchType === 'name') {
            fieldQuery = { 'customerInfo.name': { $regex: word, $options: 'i' } };
          } else if (searchType === 'phone') {
            fieldQuery = { 'customerInfo.phone': { $regex: word, $options: 'i' } };
          } else if (searchType === 'pcNumber') {
            fieldQuery = { 'customerInfo.pcNumber': { $regex: word, $options: 'i' } };
          } else if (searchType === 'contractType') {
            fieldQuery = { 'customerInfo.contractType': { $regex: word, $options: 'i' } };
          } else if (searchType === 'content') {
            fieldQuery = { 'customerInfo.content': { $regex: word, $options: 'i' } };
          } else if (searchType === 'notes') {
            fieldQuery = { notes: { $regex: word, $options: 'i' } };
          } else if (searchType === 'estimateDescription') {
            fieldQuery = { estimateDescription: { $regex: word, $options: 'i' } };
          } else if (searchType === 'productName') {
            fieldQuery = { 'tableData.productName': { $regex: word, $options: 'i' } };
          } else if (searchType === 'productCode') {
            fieldQuery = { 'tableData.productCode': { $regex: word, $options: 'i' } };
          } else if (searchType === 'distributor') {
            fieldQuery = { 'tableData.distributor': { $regex: word, $options: 'i' } };
          } else if (searchType === 'reconfirm') {
            fieldQuery = { 'tableData.reconfirm': { $regex: word, $options: 'i' } };
          } else if (searchType === 'remarks') {
            fieldQuery = { 'tableData.remarks': { $regex: word, $options: 'i' } };
          }

          keywordQueries.push(fieldQuery);
        }

        // 모든 단어가 포함되어야 하므로 $and 연산자 사용
        let keywordQuery = { $and: keywordQueries };

        // 견적 타입과 키워드 검색 조건을 함께 적용
        if (Object.keys(query).length > 0) {
          query = { $and: [query, keywordQuery] };
        } else {
          query = keywordQuery;
        }
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

    // tableData 검색 필드일 경우, 매칭된 tableData 항목의 첫 번째 요소 정보 추가
    if (
      searchType === 'productName' ||
      searchType === 'productCode' ||
      searchType === 'distributor' ||
      searchType === 'reconfirm' ||
      searchType === 'remarks'
    ) {
      projection['tableData.$'] = 1; // 매칭된 첫 번째 tableData 항목만 가져오기
    }

    // notes나 estimateDescription 필드일 경우 해당 필드도 가져오기
    if (searchType === 'notes') {
      projection.notes = 1;
    }
    if (searchType === 'estimateDescription') {
      projection.estimateDescription = 1;
    }

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
