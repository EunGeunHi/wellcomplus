import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Record from '@/models/Record';
import { withKingAuthAPI } from '../../../middleware';
import mongoose from 'mongoose';

// DELETE 요청 처리 - 레코드 삭제
async function handler(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: '유효하지 않은 레코드 ID입니다.' }, { status: 400 });
    }

    // 레코드 존재 여부 확인
    const record = await Record.findById(id);
    if (!record) {
      return NextResponse.json({ error: '삭제할 레코드를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 레코드 삭제
    await Record.findByIdAndDelete(id);

    return NextResponse.json({ message: '레코드가 삭제되었습니다.' });
  } catch (error) {
    console.error('레코드 삭제 오류:', error);
    return NextResponse.json({ error: '레코드 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const DELETE = withKingAuthAPI(handler);
