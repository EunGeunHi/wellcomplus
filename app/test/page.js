'use client';

import { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import { useSession } from 'next-auth/react';
import { KingOnlySection, LoggedInOnlySection, AuthStatus } from '../components/ProtectedContent';

export default function TestPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    // KingOnlySection 내부에서만 실행되므로 session?.user?.authority === 'king'일 때만 실행됨
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // 페이지가 마운트될 때 사용자 데이터 가져오기
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">테스트 페이지</h1>

      {/* 사용자 인증 상태 표시 */}
      <div className="mb-4">
        <AuthStatus />
      </div>

      {/* 데이터베이스 연결 테스트 - KingOnlySection 사용 */}
      <KingOnlySection
        fallback={
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <p>데이터베이스 연결 테스트는 관리자 권한이 있는 사용자만 볼 수 있습니다.</p>
          </div>
        }
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">데이터베이스 연결 테스트</h2>
          {loading ? (
            <div>로딩 중...</div>
          ) : error ? (
            <div>에러: {error}</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user._id} className="border p-4 rounded-lg">
                  <p>
                    <strong>이름:</strong> {user.name}
                  </p>
                  <p>
                    <strong>이메일:</strong> {user.email}
                  </p>
                  <p>
                    <strong>권한:</strong> {user.authority}
                  </p>
                  <p>
                    <strong>생성일:</strong> {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {users.length === 0 && <p>사용자 데이터가 없습니다.</p>}
            </div>
          )}
        </div>
      </KingOnlySection>

      {/* HeroSlider 컴포넌트 - LoggedInOnlySection 사용 */}
      <LoggedInOnlySection
        fallback={
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <p>이미지 슬라이더는 로그인한 사용자만 볼 수 있습니다.</p>
            <p>로그인하시면 더 많은 콘텐츠를 이용하실 수 있습니다.</p>
          </div>
        }
      >
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">이미지 슬라이더 (로그인 사용자용)</h2>
          <HeroSlider />
        </div>
      </LoggedInOnlySection>

      {/* 구구단 - 모든 사용자에게 표시 */}
      <div className="my-8">
        <h2 className="text-xl font-bold mb-4">구구단 2단부터 5단까지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => i + 2).map((dan) => (
            <div key={dan} className="p-4 border rounded-lg">
              <strong className="block mb-2">{dan}단:</strong>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                  <span key={num} className="block">
                    {dan} x {num} = {dan * num}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
