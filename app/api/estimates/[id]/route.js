import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withKingAuthAPI } from '@/app/api/middleware';
import mongoose from 'mongoose';

// 견적 상세 정보 조회
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

// 견적 수정
export const PUT = withKingAuthAPI(async (request, { params, session }) => {
  const { id } = params;

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: '유효하지 않은 견적 ID입니다.' }, { status: 400 });
  }

  try {
    await connectDB();

    // 요청 본문 파싱
    const updatedData = await request.json();

    // 수정일 업데이트
    updatedData.updatedAt = new Date();

    // ID 필드 제거 (MongoDB가 자동으로 처리)
    if (updatedData._id) {
      delete updatedData._id;
    }

    // 견적이 존재하는지 확인
    const existingEstimate = await mongoose.connection.db.collection('estimates').findOne({
      _id: new ObjectId(id),
    });

    if (!existingEstimate) {
      return NextResponse.json({ error: '수정할 견적을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 견적 수정
    const result = await mongoose.connection.db
      .collection('estimates')
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: '견적 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '견적이 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('견적 수정 오류:', error);
    return NextResponse.json({ error: '견적 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
});

// 견적 삭제
export const DELETE = withKingAuthAPI(async (request, { params, session }) => {
  const { id } = params;

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: '유효하지 않은 견적 ID입니다.' }, { status: 400 });
  }

  try {
    await connectDB();

    // Mongoose를 사용하여 estimates 컬렉션에 접근
    // 견적이 존재하는지 확인
    const estimate = await mongoose.connection.db.collection('estimates').findOne({
      _id: new ObjectId(id),
    });

    if (!estimate) {
      return NextResponse.json({ error: '삭제할 견적을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 견적 삭제
    const result = await mongoose.connection.db.collection('estimates').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: '견적 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '견적이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('견적 삭제 오류:', error);
    return NextResponse.json({ error: '견적 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
});
