import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { withKingAuthAPI } from '@/app/api/middleware';

/**
 * 서비스 신청 데이터 목록 조회 API
 * 관리자만 접근 가능
 */
export const GET = withKingAuthAPI(async (req, { session }) => {
  try {
    // URL 파라미터에서 상태 값과 검색 파라미터 추출
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'apply';
    const searchQuery = searchParams.get('search') || '';
    const serviceType = searchParams.get('type') || '';

    // 유효한 status 값인지 확인
    const validStatus = ['apply', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태 값입니다.' }, { status: 400 });
    }

    // MongoDB 연결
    await connectDB();

    // 정렬 방식 설정
    const sortOrder = status === 'apply' || status === 'in_progress' ? 1 : -1;

    // 검색어가 있는 경우 사용자 검색
    let userFilter = {};
    let userIds = [];

    if (searchQuery.trim()) {
      // 이름, 이메일, 전화번호 기준으로 검색
      const users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { phoneNumber: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .select('_id')
        .lean();

      userIds = users.map((user) => user._id);

      // 검색된 사용자가 없으면 빈 결과 반환
      if (searchQuery && userIds.length === 0) {
        return NextResponse.json({
          success: true,
          count: 0,
          applications: [],
        });
      }

      if (userIds.length > 0) {
        userFilter = { userId: { $in: userIds } };
      }
    }

    // 서비스 유형 필터 설정
    const typeFilter = serviceType ? { type: serviceType } : {};

    // 모든 필터 조합
    const filter = {
      status,
      ...userFilter,
      ...typeFilter,
    };

    // Application 데이터 조회 (필터 적용)
    const applications = await Application.find(filter).sort({ createdAt: sortOrder }).lean();

    // 사용자 ID 목록 추출
    const applicationUserIds = applications.map((app) => app.userId);

    // 사용자 정보 조회
    const users = await User.find({ _id: { $in: applicationUserIds } })
      .select('_id name email phoneNumber')
      .lean();

    // 사용자 ID를 키로 하는 맵 생성
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // 응답 데이터 구성
    const responseData = applications.map((app) => {
      const userId = app.userId.toString();
      const user = userMap[userId] || { name: '알 수 없음', email: '', phoneNumber: '' };

      return {
        id: app._id,
        type: app.type,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        // 서비스 유형별 정보 추가
        information: getInformation(app),
        comment: app.comment,
        // 파일 정보 추가 (Blob Storage)
        files: app.files
          ? app.files.map((file) => ({
              id: file._id,
              url: file.url,
              filename: file.filename,
              originalName: file.originalName,
              mimeType: file.mimeType,
              size: file.size,
              cloudinaryId: file.cloudinaryId || file.blobId, // fallback for legacy data
              uploadedAt: file.uploadedAt,
            }))
          : [],
      };
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      count: responseData.length,
      applications: responseData,
    });
  } catch (error) {
    console.error('서비스 신청 데이터 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});

/**
 * 서비스 유형별 세부 정보 추출
 */
function getInformation(application) {
  switch (application.type) {
    case 'computer':
      return application.computer_information;
    case 'printer':
      return application.printer_information;
    case 'notebook':
      return application.notebook_information;
    case 'as':
      return application.as_information;
    case 'inquiry':
      return application.inquiry_information;
    default:
      return {};
  }
}
