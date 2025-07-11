import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Auth.js(NextAuth) 설정 파일
 * 인증 관련 모든 기능을 처리하는 API 라우트
 */

/**
 * NextAuth 설정 객체
 */
export const authOptions = {
  // 인증 제공자 설정
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
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

        // 이메일로 사용자 검색 (탈퇴 여부 상관없이)
        const user = await User.findOne({ email: credentials.email });

        // 사용자가 없으면 null 반환 (인증 실패)
        if (!user) {
          return null;
        }

        // 탈퇴한 사용자인지 확인
        if (user.isDeleted) {
          throw new Error('DeletedAccount');
        }

        // 비밀번호 확인 (bcrypt로 해시된 비밀번호 비교)
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        // 비밀번호가 일치하지 않으면 null 반환 (인증 실패)
        if (!isPasswordValid) {
          return null;
        }

        // provider 정보가 없거나 다른 경우 업데이트
        if (!user.provider || user.provider !== 'credentials') {
          user.provider = 'credentials';
        }

        // 최근 로그인 시간 업데이트
        user.lastLoginAt = new Date();
        await user.save();

        // 인증 성공 시 사용자 정보 반환
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          authority: user.authority,
          provider: user.provider,
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
    async jwt({ token, user, account, profile }) {
      // 첫 로그인 시 user 객체에서 정보 복사
      if (user) {
        // Credentials 로그인은 이미 user.id에 MongoDB ID가 있음
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.authority = user.authority || 'user';
      }

      // 구글 로그인이고 DB에서 사용자 정보를 가져와야 하는 경우
      if (account?.provider === 'google' && profile?.email && !token.id) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: profile.email, isDeleted: false });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image;
            token.authority = dbUser.authority || 'user';
          }
        } catch (error) {
          console.error('Error fetching Google user from DB:', error);
        }
      }

      // 카카오 로그인이고 DB에서 사용자 정보를 가져와야 하는 경우
      if (account?.provider === 'kakao' && !token.id) {
        try {
          await connectDB();
          const kakaoId = profile.id?.toString();
          // 먼저 providerId로 사용자 찾기
          let dbUser = await User.findOne({
            provider: 'kakao',
            providerId: kakaoId,
            isDeleted: false,
          });

          // providerId로 찾지 못했고 이메일이 있는 경우, 이메일로 찾기
          if (!dbUser && profile.kakao_account?.email) {
            dbUser = await User.findOne({ email: profile.kakao_account.email, isDeleted: false });
          }

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image;
            token.authority = dbUser.authority || 'user';
          }
        } catch (error) {
          console.error('Error fetching Kakao user from DB:', error);
        }
      }

      // 네이버 로그인이고 DB에서 사용자 정보를 가져와야 하는 경우
      if (account?.provider === 'naver' && !token.id) {
        try {
          await connectDB();
          // 네이버는 response 객체 내에 사용자 정보가 있음
          const naverId = profile.response?.id?.toString();

          // 먼저 providerId로 사용자 찾기
          let dbUser = await User.findOne({
            provider: 'naver',
            providerId: naverId,
            isDeleted: false,
          });

          // providerId로 찾지 못했고 이메일이 있는 경우, 이메일로 찾기
          if (!dbUser && profile.response?.email) {
            dbUser = await User.findOne({ email: profile.response.email, isDeleted: false });
          }

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image;
            token.authority = dbUser.authority || 'user';
          } else {
            // DB에 사용자가 없지만 네이버 프로필 정보가 있는 경우
            if (profile.response?.name) {
              token.name = profile.response.name;
            }
            if (profile.response?.email) {
              token.email = profile.response.email;
            }
            if (profile.response?.profile_image) {
              token.image = profile.response.profile_image;
            }
          }
        } catch (error) {
          console.error('Error fetching Naver user from DB:', error);
        }
      }

      return token;
    },
    // 세션 데이터 설정 콜백
    async session({ session, token }) {
      // 세션 객체에 user 속성이 없으면 빈 객체로 초기화
      if (!session.user) {
        session.user = {};
      }

      // 세션 갱신 로직 - DB에서 최신 사용자 정보 확인
      if (token.id) {
        try {
          await connectDB();
          const latestUser = await User.findById(token.id);

          // 사용자가 탈퇴했는지 확인
          if (!latestUser || latestUser.isDeleted) {
            // 탈퇴한 사용자는 세션을 무효화
            console.log('탈퇴한 사용자 세션 무효화:', token.email);
            return null; // 세션을 null로 반환하여 로그아웃 처리
          }

          if (latestUser) {
            // DB의 최신 정보를 토큰에 업데이트
            token.name = latestUser.name;
            token.email = latestUser.email;
            token.image = latestUser.image;
            token.authority = latestUser.authority || 'user';
          }
        } catch (error) {
          console.error('Error refreshing user session from DB:', error);
        }
      }

      // 토큰의 사용자 정보를 세션에 추가
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.authority = token.authority || 'user';
      }

      return session;
    },
    // 소셜 로그인 시 사용자 정보 처리
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          await connectDB();

          // 탈퇴한 계정인지 먼저 확인
          const deletedUser = await User.findOne({ email: profile.email, isDeleted: true });
          if (deletedUser) {
            throw new Error('DeletedAccount');
          }

          // 이메일로 기존 사용자 찾기 (탈퇴하지 않은 사용자만)
          const existingUser = await User.findOne({ email: profile.email, isDeleted: false });

          // 사용자가 없으면 새로 생성
          if (!existingUser) {
            const newUser = new User({
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              authority: 'user',
              provider: 'google',
              lastLoginAt: new Date(),
            });

            const savedUser = await newUser.save();
            // MongoDB에서 생성된 ID를 user 객체에 할당
            user.id = savedUser._id.toString();
          } else {
            // 기존 사용자가 있는 경우 해당 ID 사용
            user.id = existingUser._id.toString();

            // provider 정보 업데이트 (필요한 경우)
            if (existingUser.provider !== 'google') {
              existingUser.provider = 'google';
              if (!existingUser.image && profile.picture) {
                existingUser.image = profile.picture;
              }
            }

            // 최근 로그인 시간 업데이트
            existingUser.lastLoginAt = new Date();
            await existingUser.save();
          }

          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          if (error.message === 'DeletedAccount') {
            throw new Error('DeletedAccount');
          }
          return false;
        }
      }

      if (account.provider === 'kakao') {
        try {
          await connectDB();

          // 카카오는 kakao_account 객체 내에 이메일 정보가 있음
          const email = profile.kakao_account?.email;
          // 카카오 고유 ID를 활용하여 사용자 구분
          const kakaoId = profile.id?.toString();

          // 탈퇴한 계정인지 먼저 확인
          const deletedUserByKakaoId = await User.findOne({
            provider: 'kakao',
            providerId: kakaoId,
            isDeleted: true,
          });

          const deletedUserByEmail = email ? await User.findOne({ email, isDeleted: true }) : null;

          if (deletedUserByKakaoId || deletedUserByEmail) {
            throw new Error('DeletedAccount');
          }

          // 카카오 ID로 우선 사용자 조회 (탈퇴하지 않은 사용자만)
          let existingUser = await User.findOne({
            provider: 'kakao',
            providerId: kakaoId,
            isDeleted: false,
          });

          // 이메일이 있는 경우, 이메일로도 검색 (탈퇴하지 않은 사용자만)
          if (email && !existingUser) {
            existingUser = await User.findOne({ email, isDeleted: false });
          }

          // 프로필 이미지 정보 가져오기
          const image = profile.properties?.profile_image;

          // 사용자가 없으면 새로 생성
          if (!existingUser) {
            const newUser = new User({
              name: profile.properties?.nickname || '사용자',
              email, // 이메일이 없어도 null로 저장됨
              image,
              authority: 'user',
              provider: 'kakao',
              providerId: kakaoId, // 카카오 ID 저장
              lastLoginAt: new Date(),
            });

            const savedUser = await newUser.save();
            // MongoDB에서 생성된 ID를 user 객체에 할당
            user.id = savedUser._id.toString();
          } else {
            // 기존 사용자가 있는 경우 해당 ID 사용
            user.id = existingUser._id.toString();

            // provider 정보 업데이트 (필요한 경우)
            if (existingUser.provider !== 'kakao') {
              existingUser.provider = 'kakao';
              existingUser.providerId = kakaoId;
              if (!existingUser.image && image) {
                existingUser.image = image;
              }
            }

            // 최근 로그인 시간 업데이트
            existingUser.lastLoginAt = new Date();
            await existingUser.save();
          }

          return true;
        } catch (error) {
          console.error('Error during Kakao sign in:', error);
          if (error.message === 'DeletedAccount') {
            throw new Error('DeletedAccount');
          }
          return false;
        }
      }

      if (account.provider === 'naver') {
        try {
          await connectDB();

          // 네이버는 response 객체 내에 사용자 정보가 있음
          const naverId = profile.response?.id?.toString();
          const email = profile.response?.email;
          const name = profile.response?.name;
          const image = profile.response?.profile_image;
          const mobile = profile.response?.mobile;

          // 탈퇴한 계정인지 먼저 확인
          const deletedUserByNaverId = await User.findOne({
            provider: 'naver',
            providerId: naverId,
            isDeleted: true,
          });

          const deletedUserByEmail = email ? await User.findOne({ email, isDeleted: true }) : null;

          if (deletedUserByNaverId || deletedUserByEmail) {
            throw new Error('DeletedAccount');
          }

          // 네이버 ID로 사용자 조회 (탈퇴하지 않은 사용자만)
          let existingUser = await User.findOne({
            provider: 'naver',
            providerId: naverId,
            isDeleted: false,
          });

          // 이메일이 있는 경우, 이메일로도 검색 (탈퇴하지 않은 사용자만)
          if (email && !existingUser) {
            existingUser = await User.findOne({ email, isDeleted: false });
          }

          // 사용자가 없으면 새로 생성
          if (!existingUser) {
            const newUser = new User({
              name: name || '사용자',
              email,
              image,
              phoneNumber: mobile,
              authority: 'user',
              provider: 'naver',
              providerId: naverId,
              lastLoginAt: new Date(),
            });

            const savedUser = await newUser.save();
            // MongoDB에서 생성된 ID를 user 객체에 할당
            user.id = savedUser._id.toString();
            user.name = savedUser.name;
          } else {
            // 기존 사용자가 있는 경우 해당 ID 사용
            user.id = existingUser._id.toString();
            user.name = existingUser.name;

            // provider 정보 업데이트 (필요한 경우)
            if (existingUser.provider !== 'naver') {
              existingUser.provider = 'naver';
              existingUser.providerId = naverId;

              // 기존 정보 업데이트
              if (!existingUser.email && email) {
                existingUser.email = email;
              }
              if (!existingUser.name && name) {
                existingUser.name = name;
              }
              if (!existingUser.image && image) {
                existingUser.image = image;
              }
              if (!existingUser.phoneNumber && mobile) {
                existingUser.phoneNumber = mobile;
              }
            }

            // 최근 로그인 시간 업데이트
            existingUser.lastLoginAt = new Date();
            await existingUser.save();
          }

          return true;
        } catch (error) {
          console.error('Error during Naver sign in:', error);
          if (error.message === 'DeletedAccount') {
            throw new Error('DeletedAccount');
          }
          return false;
        }
      }

      // 기본 로그인 성공 처리
      return true;
    },
  },
  // 암호화에 사용되는 비밀 키 (.env.local에 설정)
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * NextAuth 핸들러
 */
const handler = NextAuth(authOptions);

// API 라우트 핸들러 내보내기 (GET, POST 메서드 모두 처리)
export { handler as GET, handler as POST };
