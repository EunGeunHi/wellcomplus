import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { withKingAuthAPI } from '@/app/api/middleware';

// 견적 상세 정보 조회 (관리자 권한 필요)
export const GET = withKingAuthAPI(async (request, { params, session }) => {
  const { id } = params;

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: '유효하지 않은 견적 ID입니다.' }, { status: 400 });
  }

  try {
    await connectDB();

    // Mongoose를 사용하여 estimates 컬렉션에 접근
    const estimate = await mongoose.connection.db.collection('estimates').findOne({
      _id: new ObjectId(id),
    });

    if (!estimate) {
      return NextResponse.json({ error: '견적을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error('견적 조회 오류:', error);
    return NextResponse.json({ error: '견적 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
