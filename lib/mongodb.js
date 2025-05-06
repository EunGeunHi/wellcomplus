import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

// 연결 상태를 캐시하기 위한 전역 변수
let cachedConnection = null;

class Database {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
  }

  async connect() {
    // 이미 연결된 상태면 기존 연결 반환
    if (this.connection) {
      return this.connection;
    }

    // 글로벌 캐시된 연결이 있으면 사용
    if (cachedConnection) {
      this.connection = cachedConnection;
      return this.connection;
    }

    // 연결 중인 경우, 다른 요청은 현재 연결 완료를 기다림
    if (this.isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.connect();
    }

    this.isConnecting = true;

    try {
      // 연결 옵션 최적화
      const opts = {
        bufferCommands: true, // 연결이 될 때까지 명령 버퍼링
        maxPoolSize: 20, // 연결 풀 크기 증가 (필요에 따라 조정)
        minPoolSize: 5, // 최소 연결 유지
        serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃
        socketTimeoutMS: 45000, // 소켓 타임아웃
        connectTimeoutMS: 10000, // 연결 타임아웃
        family: 4, // IPv4 우선 사용
        // 인덱스를 자동으로 생성하도록 설정
        autoIndex: true,
        // 주 복제본에서 읽기 수행 (인덱스 생성을 위해 필요)
        readPreference: 'primary',
      };

      mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        this.isConnecting = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        cachedConnection = null;
        this.connection = null;
      });

      const connection = await mongoose.connect(MONGODB_URI, opts);

      // 연결 상태 업데이트
      this.connection = connection;
      cachedConnection = connection;
      this.isConnecting = false;

      return this.connection;
    } catch (error) {
      console.error('Error connecting to database:', error);
      this.isConnecting = false;
      throw error;
    }
  }
}

const database = new Database();

export default async function connectDB() {
  return database.connect();
}
