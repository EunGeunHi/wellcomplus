'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';

export default function RecordSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // 상태 정의
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // URL에서 현재 페이지와 검색어, 카테고리 필터 가져오기
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '전체';

  // 페이지와 검색어, 카테고리 필터가 변경될 때 상태 업데이트
  useEffect(() => {
    setSearch(currentSearch);
    setCategoryFilter(currentCategory);
    setPagination((prev) => ({ ...prev, page: currentPage }));
  }, [currentSearch, currentPage, currentCategory]);

  // 인증 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/manage/record/search');
    }
  }, [status, router]);

  // 레코드 목록 조회
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecords(currentPage, currentSearch, currentCategory);
    }
  }, [status, currentPage, currentSearch, currentCategory]);

  // 레코드 목록 조회 함수
  const fetchRecords = async (page, searchTerm, category) => {
    setIsLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
      });

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      if (category && category !== '전체') {
        queryParams.append('category', category);
      }

      const response = await fetch(`/api/records/list?${queryParams}`);

      if (!response.ok) {
        throw new Error('자료/기록 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      setRecords(data.records);
      setPagination(data.pagination);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 및 필터 적용 처리
  const handleSearch = (e) => {
    e.preventDefault();

    // 검색어와 카테고리 필터, 페이지 1로 URL 업데이트
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryFilter !== '전체') params.append('category', categoryFilter);
    params.append('page', '1');

    router.push(`/manage/record/search?${params.toString()}`);
  };

  // 카테고리 필터 변경 처리
  const handleCategoryFilterChange = (e) => {
    const newCategory = e.target.value;
    setCategoryFilter(newCategory);
  };

  // 페이지 변경 처리
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    const params = new URLSearchParams();
    if (currentSearch) params.append('search', currentSearch);
    if (currentCategory !== '전체') params.append('category', currentCategory);
    params.append('page', newPage.toString());

    router.push(`/manage/record/search?${params.toString()}`);
  };

  // 레코드 삭제 처리
  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/records/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제 처리 중 오류가 발생했습니다.');
      }

      // 삭제 성공 후 목록 다시 불러오기
      await fetchRecords(currentPage, currentSearch, currentCategory);

      alert('레코드가 삭제되었습니다.');
    } catch (error) {
      setError(error.message);
      alert(`오류: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
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

  // 파일 다운로드 링크 생성
  const getFileDownloadUrl = (recordId, fileIndex) => {
    return `/api/records/${recordId}/file/${fileIndex}`;
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

  // 행 클릭 시 상세 페이지로 이동
  const handleRowClick = (id, e) => {
    // 이벤트 발생 요소가 링크나 버튼이면 무시
    if (
      e.target.tagName === 'A' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('a') ||
      e.target.closest('button')
    ) {
      return;
    }

    router.push(`/manage/record/${id}`);
  };

  // 필터 초기화 처리
  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('전체');
    router.push('/manage/record/search');
  };

  if (status === 'loading') {
    return <div className="text-center p-6">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // useEffect에서 리디렉션 처리
  }

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">자료/기록 목록</h1>
          <Link
            href="/manage/record/addedit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            새 자료/기록 추가
          </Link>
        </div>

        {/* 검색 및 필터 폼 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-grow">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  제목 검색
                </label>
                <input
                  type="text"
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="제목으로 검색..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-1/4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  분류
                </label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="전체">전체</option>
                  <option value="자료">자료</option>
                  <option value="기록">기록</option>
                  <option value="없음">없음</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {(currentSearch || currentCategory !== '전체') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                  필터 초기화
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                검색 및 필터 적용
              </button>
            </div>
          </form>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 현재 적용된 필터 표시 */}
        {(currentSearch || currentCategory !== '전체') && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">적용된 필터:</span>
            {currentSearch && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                검색어: {currentSearch}
              </span>
            )}
            {currentCategory !== '전체' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                분류: {currentCategory}
              </span>
            )}
          </div>
        )}

        {/* 레코드 테이블 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  분류
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  파일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    로딩 중...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    {currentSearch || currentCategory !== '전체'
                      ? '검색 결과가 없습니다.'
                      : '등록된 레코드가 없습니다.'}
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleRowClick(record._id, e)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeStyle(
                          record.category
                        )}`}
                      >
                        {record.category || '없음'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {record.file && record.file.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {record.file.map((file, index) => (
                              <li key={index} className="mb-1">
                                <a
                                  href={getFileDownloadUrl(record._id, index)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                  title={`${file.fileName} (${Math.round(file.fileSize / 1024)} KB)`}
                                >
                                  {file.fileName}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          '파일 없음'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(record.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/manage/record/addedit?id=${record._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(record._id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className={`px-3 py-2 rounded-l-md border ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {'<<'}
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-2 border-t border-b ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {'<'}
              </button>

              <div className="px-4 py-2 border-t border-b bg-blue-50 text-blue-700">
                {pagination.page} / {pagination.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-2 border-t border-b ${
                  pagination.page === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {'>'}
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-2 rounded-r-md border ${
                  pagination.page === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {'>>'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </KingOnlySection>
  );
}
