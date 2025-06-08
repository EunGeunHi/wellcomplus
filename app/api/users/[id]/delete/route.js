import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuthAPI } from '@/app/api/middleware';

async function deleteUserHandler(request, { params, session }) {
  try {
    await connectDB();

    const { id } = params;

    // 본인만 탈퇴할 수 있도록 확인
    if (session.user.id !== id) {
      return new Response(JSON.stringify({ error: '본인만 탈퇴할 수 있습니다.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 사용자 찾기
    const user = await User.findById(id);
    if (!user) {
      return new Response(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 이미 탈퇴한 사용자인지 확인
    if (user.isDeleted) {
      return new Response(JSON.stringify({ error: '이미 탈퇴한 계정입니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // isDeleted를 true로 변경
    await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        // 탈퇴 시점 기록을 위해 updatedAt도 자동으로 업데이트됨
      },
      { new: true }
    );

    return new Response(
      JSON.stringify({
        message: '탈퇴가 성공적으로 처리되었습니다.',
        deletedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('사용자 탈퇴 처리 오류:', error);
    return new Response(JSON.stringify({ error: '탈퇴 처리 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// withAuthAPI 미들웨어로 핸들러를 래핑하여 내보내기
export const PATCH = withAuthAPI(deleteUserHandler);
