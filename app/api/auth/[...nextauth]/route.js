import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Auth.js(NextAuth) 설정 파일
 * 인증 관련 모든 기능을 처리하는 API 라우트
 */
const handler = NextAuth({
  // 인증 제공자 설정
  providers: [
    CredentialsProvider({
      name: 'Credentials', // 인증 방식 이름
      credentials: {
        // 로그인 폼 필드 정의
        email: { label: '이메일', type: 'email', placeholder: '이메일을 입력하세요' },
        password: { label: '비밀번호', type: 'password', placeholder: '비밀번호를 입력하세요' },
      },
      // 사용자 인증 로직
      async authorize(credentials) {
        // 필수 필드 체크
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // MongoDB 연결
        await connectDB();

        // 이메일로 사용자 검색
        const user = await User.findOne({ email: credentials.email });

        // 사용자가 없으면 null 반환 (인증 실패)
        if (!user) {
          return null;
        }

        // 비밀번호 확인 (bcrypt로 해시된 비밀번호 비교)
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        // 비밀번호가 일치하지 않으면 null 반환 (인증 실패)
        if (!isPasswordValid) {
          return null;
        }

        // 인증 성공 시 사용자 정보 반환
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  // 세션 설정
  session: {
    strategy: 'jwt', // JWT 기반 세션 사용
    maxAge: 7 * 24 * 60 * 60, // 7일 동안 세션 유지
  },
  // 커스텀 페이지 URL 설정
  pages: {
    signIn: '/login', // 로그인 페이지 경로
    signUp: '/signup', // 회원가입 페이지 경로
    error: '/login', // 오류 발생 시 리다이렉트할 페이지
  },
  // 콜백 함수 설정
  callbacks: {
    // JWT 토큰 생성/수정 콜백
    async jwt({ token, user }) {
      // 사용자 ID를 토큰에 추가
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // 세션 데이터 설정 콜백
    async session({ session, token }) {
      // 토큰의 사용자 ID를 세션에 추가
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  // 암호화에 사용되는 비밀 키 (.env.local에 설정)
  secret: process.env.NEXTAUTH_SECRET,
});

// API 라우트 핸들러 내보내기 (GET, POST 메서드 모두 처리)
export { handler as GET, handler as POST };
