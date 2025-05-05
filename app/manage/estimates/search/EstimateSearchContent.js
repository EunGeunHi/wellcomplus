'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/utils/dateFormat'; // dateFormat 유틸리티
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa'; // 견적서 아이콘 import 추가

export default function EstimateSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태 관리
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [estimateType, setEstimateType] = useState('');
  const [contractorStatus, setContractorStatus] = useState('');
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });
  const [error, setError] = useState(null);
  const [refreshTimestamp, setRefreshTimestamp] = useState(null);

  // localStorage의 refreshTimestamp 감지하기 위한 효과
  useEffect(() => {
    // localStorage에서 타임스탬프 확인
    const storedTimestamp = localStorage.getItem('estimatesRefreshTimestamp');
    if (storedTimestamp && (!refreshTimestamp || storedTimestamp > refreshTimestamp)) {
      setRefreshTimestamp(storedTimestamp);
      // 즉시 데이터 새로고침
      const queryKeyword = searchParams.get('keyword') || '';
      const querySearchType = searchParams.get('searchType') || 'all';
      const queryEstimateType = searchParams.get('estimateType') || '';
      const queryContractorStatus = searchParams.get('contractorStatus') || '';
      const queryPage = parseInt(searchParams.get('page') || '1', 10);

      // 캐시 방지를 위한 추가 파라미터
      searchEstimates(
        queryKeyword,
        querySearchType,
        queryEstimateType,
        queryContractorStatus,
        queryPage,
        true // forceRefresh
      );
    }
  }, [searchParams]);

  // URL 쿼리 파라미터에서 상태 초기화
  useEffect(() => {
    const queryKeyword = searchParams.get('keyword') || '';
    const querySearchType = searchParams.get('searchType') || 'all';
    const queryEstimateType = searchParams.get('estimateType') || '';
    const queryContractorStatus = searchParams.get('contractorStatus') || '';
    const queryPage = parseInt(searchParams.get('page') || '1', 10);
    const queryRefresh = searchParams.get('refresh'); // 리프레시 파라미터 확인

    setKeyword(queryKeyword);
    setSearchType(querySearchType);
    setEstimateType(queryEstimateType);
    setContractorStatus(queryContractorStatus);
    setPagination((prev) => ({
      ...prev,
      page: queryPage,
    }));

    // refresh 파라미터가 있으면 캐시를 무시하고 새로 데이터를 가져옴
    const forceRefresh = !!queryRefresh;

    // 모든 경우에 검색 실행 (키워드가 없어도 전체 데이터 조회)
    searchEstimates(
      queryKeyword,
      querySearchType,
      queryEstimateType,
      queryContractorStatus,
      queryPage,
      forceRefresh
    );
  }, [searchParams]);

  // 검색 실행 함수
  const searchEstimates = async (
    searchKeyword,
    searchTypeValue,
    estimateTypeValue,
    contractorStatusValue,
    page = 1,
    forceRefresh = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        keyword: searchKeyword,
        searchType: searchTypeValue,
        page: page.toString(),
        limit: pagination.limit.toString(),
        sort: 'createdAt_desc',
      });

      // 견적 타입이 선택된 경우에만 쿼리에 추가
      if (estimateTypeValue) {
        queryParams.set('estimateType', estimateTypeValue);
      }

      // 계약자 상태가 선택된 경우에만 쿼리에 추가
      if (contractorStatusValue) {
        queryParams.set('contractorStatus', contractorStatusValue);
      }

      // 캐시 강제 무효화를 위한 파라미터 추가
      if (forceRefresh) {
        queryParams.set('_', Date.now().toString());
      }

      const response = await fetch(`/api/estimates/search?${queryParams.toString()}`, {
        // 캐시 방지를 위한 헤더 추가
        headers: forceRefresh
          ? {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            }
          : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '검색 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setEstimates(data.estimates);
      setPagination(data.pagination);
    } catch (err) {
      console.error('검색 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();

    // URL 업데이트 (히스토리에 기록)
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    params.set('searchType', searchType);
    if (estimateType) params.set('estimateType', estimateType);
    if (contractorStatus) params.set('contractorStatus', contractorStatus);
    params.set('page', '1');

    router.push(`/manage/estimates/search?${params.toString()}`);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/manage/estimates/search?${params.toString()}`);
  };

  // 페이지네이션 생성 함수
  const getPaginationRange = () => {
    const { page, totalPages } = pagination;
    const visiblePages = 5; // 앞뒤로 보여줄 페이지 수

    let startPage = Math.max(1, page - visiblePages);
    let endPage = Math.min(totalPages, page + visiblePages);

    // 페이지가 적은 경우 모든 페이지 표시
    if (totalPages <= visiblePages * 2 + 1) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 페이지 범위 계산
    const paginationItems = [];

    // 첫 페이지
    paginationItems.push(1);

    // 처음과 시작 페이지 사이에 간격이 있는 경우 생략 부호 추가
    if (startPage > 2) {
      paginationItems.push('left-ellipsis');
    } else if (startPage === 2) {
      paginationItems.push(2);
    }

    // 중간 페이지들
    for (let i = Math.max(2, startPage); i <= Math.min(endPage, totalPages - 1); i++) {
      if (i === startPage && i > 2) continue;
      if (i === endPage && i < totalPages - 1) continue;
      paginationItems.push(i);
    }

    // 끝 페이지와 마지막 페이지 사이에 간격이 있는 경우 생략 부호 추가
    if (endPage < totalPages - 1) {
      paginationItems.push('right-ellipsis');
    } else if (endPage === totalPages - 1) {
      paginationItems.push(totalPages - 1);
    }

    // 마지막 페이지
    if (totalPages > 1) {
      paginationItems.push(totalPages);
    }

    return paginationItems;
  };

  // 검색 타입 옵션
  const searchTypeOptions = [
    { value: 'all', label: '전체' },
    { value: 'name', label: '이름' },
    { value: 'phone', label: '전화번호' },
    { value: 'pcNumber', label: 'PC번호' },
    { value: 'contractType', label: '계약구분' },
    { value: 'content', label: '내용' },
  ];

  // 견적 타입 옵션
  const estimateTypeOptions = [
    { value: '', label: '견적 타입' },
    { value: '컴퓨터견적', label: '컴퓨터견적' },
    { value: '프린터견적', label: '프린터견적' },
    { value: '노트북견적', label: '노트북견적' },
    { value: 'AS관련', label: 'AS관련' },
    { value: '예전데이터', label: '예전데이터' },
    { value: '없음', label: '없음' },
  ];

  // 계약자 상태 옵션
  const contractorStatusOptions = [
    { value: '', label: '계약/비계약' },
    { value: 'true', label: '계약자' },
    { value: 'false', label: '비계약자' },
  ];

  // 견적 상세 페이지로 이동하는 핸들러 추가
  const handleRowClick = (estimateId) => {
    router.push(`/manage/estimates/detail/${estimateId}`);
  };

  // 견적서 페이지로 이동하는 핸들러 추가
  const handleQuoteClick = (e, estimateId) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    router.push(`/manage/quote/${estimateId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">견적 검색</h1>
        <div className="flex flex-row space-x-2 whitespace-nowrap">
          <Link
            href="/manage/quote/statement"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
          >
            <FaFileAlt className="mr-1" /> 거래명세표인쇄
          </Link>
          <Link
            href="/manage/estimates/create"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            새로운 데이터 추가
          </Link>
        </div>
      </div>

      {/* 검색 폼 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[150px]">
            <select
              value={estimateType}
              onChange={(e) => setEstimateType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {estimateTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {searchTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <select
              value={contractorStatus}
              onChange={(e) => setContractorStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {contractorStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-[3] min-w-[300px]">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어를 입력하세요 (전체 목록 보기: 빈칸)"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </form>
      </div>

      {/* 에러 메시지 */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* 검색 결과 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">견적 타입</th>
              <th className="px-4 py-2 text-left">이름</th>
              <th className="px-4 py-2 text-left">연락처</th>
              <th className="px-4 py-2 text-left">계약상태</th>
              <th className="px-4 py-2 text-left">생성일</th>
              <th className="px-4 py-2 text-center">견적서</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {estimates.length > 0 ? (
              estimates.map((estimate) => (
                <tr
                  key={estimate._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(estimate._id)}
                >
                  <td className="px-3 py-1">{estimate.estimateType || '없음'}</td>
                  <td className="px-3 py-1">{estimate.customerInfo.name || '-'}</td>
                  <td className="px-3 py-1">{estimate.customerInfo.phone || '-'}</td>
                  <td className="px-3 py-1">
                    <span
                      className={
                        estimate.isContractor ? 'text-green-600 font-medium' : 'text-gray-500'
                      }
                    >
                      {estimate.isContractor ? '계약자' : '비계약자'}
                    </span>
                  </td>
                  <td className="px-3 py-1">
                    {estimate.createdAt
                      ? formatDate(estimate.createdAt, { shortFormat: true })
                      : '-'}
                  </td>
                  <td className="px-3 py-1 text-center">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-5 py-[3px] rounded flex items-center justify-center mx-auto"
                      onClick={(e) => handleQuoteClick(e, estimate._id)}
                      title="견적서 인쇄"
                    >
                      <FaFileAlt className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center">
                  {loading ? '데이터를 불러오는 중...' : '검색 결과가 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 개선된 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-1">
            {/* 처음으로 버튼 */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className={`px-2 py-1 rounded ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="처음으로"
            >
              <span className="sr-only">처음으로</span>
              <span aria-hidden="true">&laquo;&laquo;</span>
            </button>

            {/* 10페이지 이전 버튼 */}
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 10))}
              disabled={pagination.page <= 1}
              className={`px-2 py-1 rounded ${
                pagination.page <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="10페이지 이전"
            >
              <span className="sr-only">10페이지 이전</span>
              <span aria-hidden="true">&laquo;</span>
            </button>

            {/* 페이지 번호 */}
            {getPaginationRange().map((pageItem, index) => {
              if (pageItem === 'left-ellipsis' || pageItem === 'right-ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-3 py-1">
                    &hellip;
                  </span>
                );
              }

              return (
                <button
                  key={`page-${pageItem}`}
                  onClick={() => handlePageChange(pageItem)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === pageItem
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {pageItem}
                </button>
              );
            })}

            {/* 10페이지 다음 버튼 */}
            <button
              onClick={() =>
                handlePageChange(Math.min(pagination.totalPages, pagination.page + 10))
              }
              disabled={pagination.page >= pagination.totalPages}
              className={`px-2 py-1 rounded ${
                pagination.page >= pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="10페이지 다음"
            >
              <span className="sr-only">10페이지 다음</span>
              <span aria-hidden="true">&raquo;</span>
            </button>

            {/* 마지막으로 버튼 */}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-2 py-1 rounded ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="마지막으로"
            >
              <span className="sr-only">마지막으로</span>
              <span aria-hidden="true">&raquo;&raquo;</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
