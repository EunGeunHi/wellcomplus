const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function addIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');

    const db = client.db();
    const usersCollection = db.collection('users');

    // 기존 인덱스 확인
    console.log('\n=== 기존 인덱스 확인 ===');
    const existingIndexes = await usersCollection.indexes();
    console.log(
      '기존 인덱스:',
      existingIndexes.map((idx) => idx.name)
    );

    // 성능 최적화를 위한 인덱스 추가
    console.log('\n=== 인덱스 추가 중 ===');

    // 1. name 필드 인덱스 (중복 확인용)
    try {
      await usersCollection.createIndex(
        { name: 1 },
        {
          name: 'name_1',
          background: true,
        }
      );
      console.log('✅ name 인덱스 추가 완료');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  name 인덱스가 이미 존재합니다.');
      } else {
        console.error('❌ name 인덱스 추가 실패:', error.message);
      }
    }

    // 2. phoneNumber 필드 인덱스 (중복 확인용)
    try {
      await usersCollection.createIndex(
        { phoneNumber: 1 },
        {
          name: 'phoneNumber_1',
          background: true,
          sparse: true, // null 값 제외
        }
      );
      console.log('✅ phoneNumber 인덱스 추가 완료');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  phoneNumber 인덱스가 이미 존재합니다.');
      } else {
        console.error('❌ phoneNumber 인덱스 추가 실패:', error.message);
      }
    }

    // 3. email 필드 인덱스 (로그인 최적화용)
    try {
      await usersCollection.createIndex(
        { email: 1 },
        {
          name: 'email_1',
          background: true,
          sparse: true, // null 값 제외
        }
      );
      console.log('✅ email 인덱스 추가 완료');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  email 인덱스가 이미 존재합니다.');
      } else {
        console.error('❌ email 인덱스 추가 실패:', error.message);
      }
    }

    // 4. 복합 인덱스: name + _id (중복 확인 시 현재 사용자 제외용)
    try {
      await usersCollection.createIndex(
        { name: 1, _id: 1 },
        {
          name: 'name_1__id_1',
          background: true,
        }
      );
      console.log('✅ name + _id 복합 인덱스 추가 완료');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  name + _id 복합 인덱스가 이미 존재합니다.');
      } else {
        console.error('❌ name + _id 복합 인덱스 추가 실패:', error.message);
      }
    }

    // 5. 복합 인덱스: phoneNumber + _id (중복 확인 시 현재 사용자 제외용)
    try {
      await usersCollection.createIndex(
        { phoneNumber: 1, _id: 1 },
        {
          name: 'phoneNumber_1__id_1',
          background: true,
          sparse: true,
        }
      );
      console.log('✅ phoneNumber + _id 복합 인덱스 추가 완료');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  phoneNumber + _id 복합 인덱스가 이미 존재합니다.');
      } else {
        console.error('❌ phoneNumber + _id 복합 인덱스 추가 실패:', error.message);
      }
    }

    // 최종 인덱스 확인
    console.log('\n=== 최종 인덱스 확인 ===');
    const finalIndexes = await usersCollection.indexes();
    console.log('현재 인덱스 목록:');
    finalIndexes.forEach((idx) => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🎉 인덱스 추가 작업이 완료되었습니다!');
    console.log('📈 예상 성능 향상: 중복 확인 쿼리 속도 10-100배 개선');
  } catch (error) {
    console.error('❌ 인덱스 추가 중 오류 발생:', error);
  } finally {
    await client.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
if (require.main === module) {
  addIndexes().catch(console.error);
}

module.exports = addIndexes;
