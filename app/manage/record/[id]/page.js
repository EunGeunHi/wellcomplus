'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const recordId = params.id;

  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?returnUrl=/manage/record/${recordId}`);
    }
  }, [status, router, recordId]);

  // 레코드 상세 정보 조회
  useEffect(() => {
    if (status === 'authenticated' && recordId) {
      fetchRecordDetail();
    }
  }, [status, recordId]);

  const fetchRecordDetail = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/records/${recordId}`);

      if (!response.ok) {
        throw new Error('자료/기록 상세 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setRecord(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 다운로드 링크 생성
  const getFileDownloadUrl = (recordId, fileIndex) => {
    return `/api/records/${recordId}/file/${fileIndex}`;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 카테고리 배지 스타일 설정
  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case '자료':
        return 'bg-blue-100 text-blue-800';
      case '기록':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 레코드 삭제 처리
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/records/delete/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제 처리 중 오류가 발생했습니다.');
      }

      alert('레코드가 삭제되었습니다.');
      // 삭제 성공 후 목록 페이지로 이동
      router.push('/manage/record/search');
    } catch (error) {
      setError(error.message);
      alert(`오류: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center p-6">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // useEffect에서 리디렉션 처리
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link
          href="/manage/record/search"
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!record) {
    return <div className="text-center p-6">레코드를 찾을 수 없습니다.</div>;
  }

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">자료/기록 상세 정보</h1>
          <div className="flex gap-2">
            <Link
              href={`/manage/record/addedit?id=${recordId}`}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              수정하기
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제하기'}
            </button>
            <Link
              href="/manage/record/search"
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              목록으로
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold">{record.title}</h2>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeStyle(
                  record.category
                )}`}
              >
                {record.category || '없음'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {record.name && <p className="mb-1">작성자: {record.name}</p>}
              <p>등록일: {formatDate(record.createdAt)}</p>
              <p>최종 수정일: {formatDate(record.updatedAt)}</p>
            </div>
          </div>

          {record.file && record.file.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">첨부 파일</h3>
              <ul className="list-disc pl-5 space-y-1">
                {record.file.map((file, index) => (
                  <li key={index}>
                    <a
                      href={getFileDownloadUrl(record._id, index)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <span className="mr-2">{file.fileName}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(file.fileSize / 1024)} KB)
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {record.content && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">내용</h3>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">{record.content}</div>
            </div>
          )}
        </div>
      </div>
    </KingOnlySection>
  );
}
