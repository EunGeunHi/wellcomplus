import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 요청 본문에서 경로 가져오기
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: '캐시 무효화할 경로가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // Next.js의 revalidatePath 함수를 사용하여 캐시 무효화
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      message: `${path} 경로의 캐시가 성공적으로 무효화되었습니다.`,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('캐시 무효화 오류:', error);
    return NextResponse.json({ error: '캐시 무효화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
