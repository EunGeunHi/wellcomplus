'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/utils/dateFormat'; // dateFormat 유틸리티
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa'; // 견적서 아이콘 import 추가
import useSWR, { mutate } from 'swr';
import { debounce } from 'lodash';

// SWR fetcher 함수 정의
const fetcher = async (url) => {
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('데이터를 불러오는데 실패했습니다.');
  }

  return response.json();
};

export default function EstimateSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialLoadRef = useRef(true);

  // 상태 관리
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [estimateType, setEstimateType] = useState('');
  const [contractorStatus, setContractorStatus] = useState('');
  const [error, setError] = useState(null);
  const [refreshTimestamp, setRefreshTimestamp] = useState(null);

  // 쿼리 파라미터 상태를 메모이제이션
  const queryParams = useMemo(() => {
    return {
      keyword: searchParams.get('keyword') || '',
      searchType: searchParams.get('searchType') || 'all',
      estimateType: searchParams.get('estimateType') || '',
      contractorStatus: searchParams.get('contractorStatus') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
    };
  }, [searchParams]);

  // SWR 캐시 키 생성
  const cacheKey = useMemo(() => {
    const params = new URLSearchParams({
      keyword: queryParams.keyword,
      searchType: queryParams.searchType,
      page: queryParams.page.toString(),
      limit: '15',
      sort: 'createdAt_desc',
    });

    if (queryParams.estimateType) {
      params.set('estimateType', queryParams.estimateType);
    }

    if (queryParams.contractorStatus) {
      params.set('contractorStatus', queryParams.contractorStatus);
    }

    return `/api/estimates/search?${params.toString()}`;
  }, [queryParams]);

  // SWR을 사용한 데이터 패칭
  const {
    data,
    error: swrError,
    isLoading: loading,
    mutate: refreshData,
  } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    dedupingInterval: 60000, // 1분으로 증가
    focusThrottleInterval: 10000, // 포커스 이벤트 제한
    revalidateOnMount: true,
    refreshInterval: 0, // 자동 갱신 비활성화
    suspense: false, // 필요에 따라 Suspense 모드 활성화 가능
    onSuccess: (data) => {
      // 성공 시 localStorage에 저장하여 다음 방문 시 활용
      localStorage.setItem('estimatesLastData', JSON.stringify(data));
      localStorage.setItem('estimatesLastFetch', Date.now().toString());
    },
    fallbackData: (() => {
      // localStorage에서 초기 데이터 로드
      try {
        const cached = localStorage.getItem('estimatesLastData');
        return cached ? JSON.parse(cached) : null;
      } catch (e) {
        return null;
      }
    })(),
  });

  const estimates = data?.estimates || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 0 };

  // 모든 견적 캐시 무효화 함수
  const invalidateAllEstimateCache = useCallback(() => {
    // 캐시 패턴을 무효화 (estimates 관련 모든 API 요청)
    mutate((key) => typeof key === 'string' && key.includes('/api/estimates'), undefined, {
      revalidate: true,
    });
  }, []);

  // Debounce 적용된 검색어 업데이트
  const updateKeywordDebounced = useCallback(
    debounce((value) => {
      setDebouncedKeyword(value);
    }, 300), // 300ms 디바운스
    []
  );

  // localStorage의 refreshTimestamp 감지하기 위한 효과
  useEffect(() => {
    // localStorage에서 타임스탬프 확인
    const storedTimestamp = localStorage.getItem('estimatesRefreshTimestamp');
    if (storedTimestamp && (!refreshTimestamp || storedTimestamp > refreshTimestamp)) {
      setRefreshTimestamp(storedTimestamp);
      // 즉시 데이터 새로고침
      invalidateAllEstimateCache();
      refreshData();
    }
  }, [refreshTimestamp, invalidateAllEstimateCache, refreshData]);

  // 페이지 로드/포커스 시 데이터 변경 감지 및 갱신
  useEffect(() => {
    // 페이지 로드 시 새로고침 필요 여부 확인
    const checkAndRefresh = () => {
      const needsRefresh = localStorage.getItem('estimatesNeedRefresh');
      if (needsRefresh === 'true') {
        console.log('데이터 변경 감지: 견적 목록 새로고침');
        // 캐시 무효화 및 데이터 갱신
        invalidateAllEstimateCache();
        refreshData();
        // 플래그 초기화
        localStorage.removeItem('estimatesNeedRefresh');
      }

      // 특정 ID 수정/삭제 감지
      const lastModifiedId = localStorage.getItem('lastModifiedEstimateId');
      const lastModifiedAction = localStorage.getItem('lastModifiedEstimateAction');

      if (lastModifiedId && lastModifiedAction) {
        console.log(`${lastModifiedAction} 작업 감지: ID ${lastModifiedId}`);
        // 특정 ID 관련 캐시 무효화
        invalidateAllEstimateCache(); // 전체 캐시 무효화
        refreshData();

        // 플래그 초기화
        localStorage.removeItem('lastModifiedEstimateId');
        localStorage.removeItem('lastModifiedEstimateAction');
      }

      // 수정 완료 감지
      const editedId = localStorage.getItem('estimateBeingEdited');
      if (editedId) {
        // 수정 중인 ID가 있었다면 캐시 무효화 (수정 페이지 방문 후 돌아온 경우)
        invalidateAllEstimateCache();
        refreshData();
        localStorage.removeItem('estimateBeingEdited');
      }
    };

    // 초기 로드 시 확인
    checkAndRefresh();

    // 포커스 이벤트 핸들러 - 브라우저 탭이 활성화될 때마다 실행
    const handleFocus = () => {
      checkAndRefresh();
    };

    // 페이지 가시성 변화 이벤트 핸들러
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefresh();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 스토리지 이벤트 리스너 (다른 탭에서 변경 감지)
    const handleStorageChange = (event) => {
      if (
        event.key === 'estimatesRefreshTimestamp' ||
        event.key === 'estimatesNeedRefresh' ||
        event.key === 'lastModifiedEstimateId'
      ) {
        checkAndRefresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [invalidateAllEstimateCache, refreshData]);

  // URL 쿼리 파라미터에서 상태 초기화
  useEffect(() => {
    setKeyword(queryParams.keyword);
    setDebouncedKeyword(queryParams.keyword);
    setSearchType(queryParams.searchType);
    setEstimateType(queryParams.estimateType);
    setContractorStatus(queryParams.contractorStatus);

    // 초기 로드 이후에는 false로 변경
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [queryParams]);

  // SWR 에러 처리
  useEffect(() => {
    if (swrError) {
      setError(swrError.message);
    } else {
      setError(null);
    }
  }, [swrError]);

  // 검색어 변경 핸들러
  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    updateKeywordDebounced(value);
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
    { value: 'all', label: '전체(데이터 범위)' },
    { value: 'name', label: '이름' },
    { value: 'phone', label: '전화번호' },
    { value: 'pcNumber', label: 'PC번호' },
    { value: 'contractType', label: '계약구분' },
    { value: 'content', label: '내용' },
    { value: 'notes', label: '참고사항(관리자)' },
    { value: 'estimateDescription', label: '견적설명(사용자)' },
    { value: 'productName', label: '상품명' },
    { value: 'productCode', label: '상품코드' },
    { value: 'distributor', label: '총판' },
    { value: 'reconfirm', label: '제조사' },
    { value: 'remarks', label: '비고' },
  ];

  // 견적 타입 옵션
  const estimateTypeOptions = [
    { value: '', label: '전체(견적타입)' },
    { value: '컴퓨터', label: '컴퓨터' },
    { value: '프린터', label: '프린터' },
    { value: '노트북', label: '노트북' },
    { value: 'AS관련', label: 'AS관련' },
    { value: '예전데이터', label: '예전데이터' },
    { value: '사업자', label: '사업자' },
  ];

  // 계약자 상태 옵션
  const contractorStatusOptions = [
    { value: '', label: '계약/비계약' },
    { value: 'true', label: '계약자' },
    { value: 'false', label: '비계약자' },
  ];

  // 견적 상세 페이지로 이동하는 핸들러 추가
  const handleRowClick = (estimateId) => {
    // 현재 URL의 검색 파라미터를 유지하기 위해 from_search 파라미터 추가
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.append('from_search', 'true');

    router.push(`/manage/estimates/detail/${estimateId}?${currentParams.toString()}`);
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
            onClick={() => {
              // 새 페이지로 이동 시 캐시를 무효화 플래그 설정
              localStorage.setItem('estimatesNeedRefresh', 'true');
            }}
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
              onChange={handleKeywordChange}
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

      {/* 검색 결과 정보 */}
      <div className="mb-3 flex justify-between items-center">
        <div>
          <span className="font-medium">총 {pagination.total}개</span>의 견적 데이터
          {keyword && (
            <>
              {' '}
              중 <span className="text-blue-600 font-medium">'{keyword}'</span>
              {searchType !== 'all' && (
                <> ({searchTypeOptions.find((option) => option.value === searchType)?.label})</>
              )}{' '}
              검색 결과
            </>
          )}
        </div>
        {estimateType && (
          <div className="bg-gray-100 px-3 py-1 rounded text-sm">
            견적 타입: <span className="font-medium">{estimateType}</span>
          </div>
        )}
      </div>

      {/* 검색 결과 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left w-[110px]">견적 타입</th>
              <th className="px-4 py-2 text-left">이름</th>
              <th className="px-4 py-2 text-left">PC번호</th>
              <th className="px-4 py-2 text-left">연락처</th>
              <th className="px-4 py-2 text-left w-[100px]">계약상태</th>
              <th className="px-4 py-2 text-left w-[120px]">생성일</th>
              <th className="px-4 py-2 text-center w-[85px]">견적서</th>
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
                  <td className="px-3 py-1">{estimate.customerInfo.pcNumber || '-'}</td>
                  <td className="px-3 py-1">{estimate.customerInfo.phone || '-'}</td>
                  <td className="px-3 py-1">
                    <span
                      className={
                        estimate.estimateType === '예전데이터'
                          ? 'text-gray-400'
                          : estimate.isContractor === true
                            ? 'text-green-600 font-medium'
                            : estimate.isContractor === false
                              ? 'text-gray-500'
                              : 'text-gray-400'
                      }
                    >
                      {estimate.estimateType === '예전데이터'
                        ? '없음'
                        : estimate.isContractor === true
                          ? '계약자'
                          : estimate.isContractor === false
                            ? '비계약자'
                            : '없음'}
                    </span>
                  </td>
                  <td className="px-3 py-1">
                    {estimate.createdAt ? formatDate(estimate.createdAt, { hyphen: true }) : '-'}
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
                <td colSpan="7" className="px-4 py-6 text-center">
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
