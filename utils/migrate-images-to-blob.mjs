import connectDB from '../lib/mongodb.js';
import Review from '../models/review.js';

/**
 * 기존 바이너리 데이터가 있는 리뷰들을 정리
 */
async function cleanupOldReviews() {
  console.log('🧹 기존 바이너리 데이터가 있는 리뷰들을 정리합니다...');

  try {
    await connectDB();
    console.log('✅ MongoDB 연결 성공');

    // 바이너리 데이터가 있는 리뷰들 조회
    const reviewsWithBinaryData = await Review.find({
      'images.data': { $exists: true, $ne: null },
    });

    console.log(`📊 정리 대상 리뷰: ${reviewsWithBinaryData.length}개`);

    if (reviewsWithBinaryData.length === 0) {
      console.log('✅ 정리할 리뷰가 없습니다.');
      return;
    }

    // 기존 리뷰들 삭제
    const deleteResult = await Review.deleteMany({
      'images.data': { $exists: true, $ne: null },
    });

    console.log(`✅ ${deleteResult.deletedCount}개의 기존 리뷰가 삭제되었습니다.`);
  } catch (error) {
    console.error('❌ 정리 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 데이터베이스 상태 확인
 */
async function checkDatabaseStatus() {
  try {
    await connectDB();

    const totalReviews = await Review.countDocuments({});
    const reviewsWithBinaryData = await Review.countDocuments({
      'images.data': { $exists: true, $ne: null },
    });
    const reviewsWithBlobData = await Review.countDocuments({
      'images.url': { $exists: true, $ne: null },
    });

    console.log('\n📊 데이터베이스 상태:');
    console.log(`  전체 리뷰: ${totalReviews}개`);
    console.log(`  바이너리 데이터 보유: ${reviewsWithBinaryData}개`);
    console.log(`  Blob Storage 사용: ${reviewsWithBlobData}개`);

    if (reviewsWithBinaryData === 0) {
      console.log('✅ 모든 리뷰가 Blob Storage를 사용합니다!');
    } else {
      console.log(`⚠️  ${reviewsWithBinaryData}개 리뷰에 아직 바이너리 데이터가 남아있습니다.`);
    }
  } catch (error) {
    console.error('❌ 상태 확인 중 오류:', error);
  }
}

/**
 * 모든 리뷰 데이터 삭제 (개발/테스트 용도)
 */
async function deleteAllReviews() {
  console.log('🗑️  모든 리뷰 데이터를 삭제합니다...');

  try {
    await connectDB();

    const deleteResult = await Review.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount}개의 리뷰가 삭제되었습니다.`);
  } catch (error) {
    console.error('❌ 삭제 중 오류:', error);
  }
}

/**
 * Blob Storage 스키마 검증
 */
async function validateBlobSchema() {
  console.log('🔍 Blob Storage 스키마를 검증합니다...');

  try {
    await connectDB();

    const reviews = await Review.find({ 'images.0': { $exists: true } }).limit(10);

    console.log(`📊 검증 대상 리뷰: ${reviews.length}개`);

    let validCount = 0;
    let invalidCount = 0;

    for (const review of reviews) {
      let isValid = true;

      for (const image of review.images) {
        const requiredFields = ['url', 'filename', 'originalName', 'mimeType', 'size', 'blobId'];
        const missingFields = requiredFields.filter((field) => !image[field]);

        if (missingFields.length > 0) {
          console.log(`  ❌ 리뷰 ${review._id}: 누락된 필드 - ${missingFields.join(', ')}`);
          isValid = false;
        }

        // 바이너리 데이터가 남아있는지 확인
        if (image.data) {
          console.log(`  ⚠️  리뷰 ${review._id}: 바이너리 데이터가 남아있음`);
          isValid = false;
        }
      }

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    }

    console.log(`\n📊 검증 결과:`);
    console.log(`  유효한 리뷰: ${validCount}개`);
    console.log(`  문제가 있는 리뷰: ${invalidCount}개`);
  } catch (error) {
    console.error('❌ 검증 중 오류:', error);
  }
}

// 스크립트 실행
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'cleanup':
      await cleanupOldReviews();
      break;
    case 'status':
      await checkDatabaseStatus();
      break;
    case 'delete-all':
      const confirm = process.argv[3];
      if (confirm === '--confirm') {
        await deleteAllReviews();
      } else {
        console.log('⚠️  모든 데이터를 삭제하려면 --confirm 플래그를 추가하세요:');
        console.log('  node utils/migrate-images-to-blob.js delete-all --confirm');
      }
      break;
    case 'validate':
      await validateBlobSchema();
      break;
    default:
      console.log('사용법:');
      console.log(
        '  node utils/migrate-images-to-blob.js cleanup     # 기존 바이너리 데이터 리뷰 삭제'
      );
      console.log('  node utils/migrate-images-to-blob.js status      # 데이터베이스 상태 확인');
      console.log('  node utils/migrate-images-to-blob.js validate    # Blob Storage 스키마 검증');
      console.log('  node utils/migrate-images-to-blob.js delete-all --confirm  # 모든 리뷰 삭제');
  }

  process.exit(0);
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { cleanupOldReviews, checkDatabaseStatus, deleteAllReviews, validateBlobSchema };
