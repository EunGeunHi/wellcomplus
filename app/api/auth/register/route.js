import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { isValidPhoneNumber } from '@/app/utils/phoneFormatter';

/**
 * 회원가입 API 엔드포인트
 * POST 요청을 처리하여 새 사용자를 생성하는 함수
 */
export async function POST(req) {
  try {
    // 요청 본문에서 사용자 정보 추출
    const { name, email, phoneNumber, password } = await req.json();

    // 필수 필드 검증
    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { success: false, message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증 (정규식 사용)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '유효한 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 전화번호 유효성 검사
    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: '유효한 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증 (최소 6자)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // MongoDB 연결
    await connectDB();

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '이미 사용 중인 이메일입니다.' },
        { status: 409 } // 충돌 상태 코드
      );
    }

    // 전화번호 중복 확인
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser) {
      return NextResponse.json(
        { success: false, message: '이미 사용 중인 전화번호입니다.' },
        { status: 409 } // 충돌 상태 코드
      );
    }

    // 비밀번호 해싱 (bcrypt 사용, 보안을 위해 평문 저장 방지)
    const hashedPassword = await bcrypt.hash(password, 12); // 12는 salt 라운드 수

    // 새 사용자 객체 생성
    const newUser = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword, // 해시된 비밀번호 저장
    });

    // 사용자 정보 데이터베이스에 저장
    await newUser.save();

    // 성공 응답 반환
    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다. 로그인해주세요.',
      },
      { status: 201 } // 리소스 생성 성공 상태 코드
    );
  } catch (error) {
    // 오류 로깅 및 에러 응답 반환
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 } // 서버 오류 상태 코드
    );
  }
}
