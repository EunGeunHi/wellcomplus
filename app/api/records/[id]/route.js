import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Record from '@/models/Record';
import { withKingAuthAPI } from '../../middleware';
import mongoose from 'mongoose';

// GET 요청 처리 - 기존 레코드 조회
async function getHandler(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: '유효하지 않은 레코드 ID입니다.' }, { status: 400 });
    }

    // 레코드 조회
    const record = await Record.findById(id);

    if (!record) {
      return NextResponse.json({ error: '레코드를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 데이터는 제외하고 파일 메타데이터만 반환
    const recordData = record.toObject();

    // 파일 정보 가공
    if (recordData.file && recordData.file.length > 0) {
      recordData.file = recordData.file.map((file) => ({
        fileName: file.fileName,
        contentType: file.contentType,
        fileSize: file.fileSize,
        // 실제 파일 데이터는 제외
      }));
    }

    return NextResponse.json(recordData);
  } catch (error) {
    console.error('레코드 조회 오류:', error);
    return NextResponse.json({ error: '레코드 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PUT 요청 처리 - 기존 레코드 수정
async function putHandler(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: '유효하지 않은 레코드 ID입니다.' }, { status: 400 });
    }

    // 레코드 존재 여부 확인
    const existingRecord = await Record.findById(id);
    if (!existingRecord) {
      return NextResponse.json({ error: '수정할 레코드를 찾을 수 없습니다.' }, { status: 404 });
    }

    // FormData에서 데이터 추출
    const formData = await req.formData();

    // 기본 필드 추출
    const title = formData.get('title');
    const name = formData.get('name');
    const content = formData.get('content');
    const category = formData.get('category') || '없음';

    // 제목은 필수 입력 필드
    if (!title) {
      return NextResponse.json({ error: '제목은 필수 입력 항목입니다.' }, { status: 400 });
    }

    // 카테고리 유효성 검사
    if (!['자료', '기록', '없음'].includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }

    // 업데이트할 데이터 준비
    const updateData = {
      title,
      name: name || '',
      content: content || '',
      category,
    };

    // 파일 처리 - 새 파일이 있는 경우만 처리
    const files = formData.getAll('files');
    const keepExistingFiles = formData.get('keepExistingFiles') === 'true';

    // 기존 파일 유지 여부에 따라 처리
    if (keepExistingFiles) {
      // 기존 파일에 새 파일 추가
      if (files && files.length > 0 && files[0] instanceof File) {
        if (!existingRecord.file) {
          existingRecord.file = [];
        }

        for (const file of files) {
          if (file instanceof File && file.size > 0) {
            // 파일을 ArrayBuffer로 변환 후 Buffer로 변환
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 파일 정보 추가
            existingRecord.file.push({
              data: buffer,
              contentType: file.type,
              fileName: file.name,
              fileSize: file.size,
            });
          }
        }

        updateData.file = existingRecord.file;
      }
    } else {
      // 기존 파일 삭제하고 새 파일로 대체
      const newFiles = [];

      if (files && files.length > 0) {
        for (const file of files) {
          if (file instanceof File && file.size > 0) {
            // 파일을 ArrayBuffer로 변환 후 Buffer로 변환
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 파일 정보 추가
            newFiles.push({
              data: buffer,
              contentType: file.type,
              fileName: file.name,
              fileSize: file.size,
            });
          }
        }
      }

      updateData.file = newFiles;
    }

    // 데이터베이스 업데이트
    const updatedRecord = await Record.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      message: '레코드가 수정되었습니다.',
      recordId: updatedRecord._id,
    });
  } catch (error) {
    console.error('레코드 수정 오류:', error);
    return NextResponse.json({ error: '레코드 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const GET = withKingAuthAPI(getHandler);
export const PUT = withKingAuthAPI(putHandler);
