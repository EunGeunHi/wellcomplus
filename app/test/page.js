'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchUsers();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">데이터베이스 연결 테스트</h1>
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
              <strong>생성일:</strong> {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {users.length === 0 && <p>사용자 데이터가 없습니다.</p>}
      </div>
    </div>
  );
}
