import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withKingAuthAPI } from '@/app/api/middleware';
import {
  deleteMultipleFilesFromCloudinary,
  deleteFileFromCloudinary,
} from '@/lib/application-storage';
import { forceDeleteFromCloudinary } from '@/lib/cloudinary';

/**
 * 애플리케이션 완전 삭제 API (강력한 파일 삭제 포함)
 * 취소 상태의 애플리케이션만 삭제 가능
 * 관리자만 접근 가능
 * 모든 확장자 파일을 완전 삭제 보장
 */
export const DELETE = withKingAuthAPI(async (req, { params }) => {
  try {
    const { id } = params;

    // MongoDB 연결
    await connectDB();

    // 애플리케이션 조회
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: '해당 서비스 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 취소 상태인지 확인
    if (application.status !== 'cancelled') {
      return NextResponse.json(
        { error: '취소 상태의 신청만 완전 삭제할 수 있습니다.' },
        { status: 400 }
      );
    }

    // Cloudinary에서 모든 파일 삭제 (강력한 삭제 적용)
    if (application.files && application.files.length > 0) {
      try {
        const cloudinaryIds = application.files
          .map((file) => file.cloudinaryId || file.blobId)
          .filter((id) => id);

        if (cloudinaryIds.length > 0) {
          // 1차: 다중 파일 삭제 시도
          const deleteResult = await deleteMultipleFilesFromCloudinary(cloudinaryIds);

          // 2차: 삭제되지 않은 파일들을 개별적으로 강제 삭제
          const deletedIds = Object.keys(deleteResult.deleted || {});
          const failedIds = cloudinaryIds.filter((id) => !deletedIds.includes(id));

          if (failedIds.length > 0) {
            for (const failedId of failedIds) {
              try {
                // 1차: 일반 개별 삭제 시도
                await deleteFileFromCloudinary(failedId);
              } catch (individualError) {
                // 2차: 최종 강제 삭제 시도
                try {
                  await forceDeleteFromCloudinary(failedId);
                } catch (forceError) {
                  // 모든 방법이 실패해도 계속 진행
                }
              }
            }
          }

          // 3차: 모든 파일에 대해 최종 확인 및 강제 삭제
          for (const cloudinaryId of cloudinaryIds) {
            try {
              // 마지막으로 한 번 더 강제 삭제 시도 (이미 삭제된 파일은 not found 반환)
              await forceDeleteFromCloudinary(cloudinaryId);
            } catch (finalError) {
              // 이미 삭제된 파일이거나 완전히 삭제 불가능한 파일
            }
          }
        }
      } catch (error) {
        console.error('Cloudinary 파일 삭제 오류:', error);
        // Cloudinary 삭제 실패해도 DB 삭제는 진행
      }
    }

    // MongoDB에서 애플리케이션 완전 삭제
    await Application.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '서비스 신청이 완전히 삭제되었습니다.',
    });
  } catch (error) {
    console.error('애플리케이션 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
});
