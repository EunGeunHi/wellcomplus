'use client';
import { useState, useEffect } from 'react';
import KingFallback from '../components/kingFallback';
import { KingOnlySection } from '../components/ProtectedContent';
import Link from 'next/link';
import {
  FiClock,
  FiStar,
  FiRefreshCw,
  FiFileText,
  FiServer,
  FiMessageSquare,
  FiHardDrive,
  FiTrash2,
  FiCoffee,
  FiDownload,
} from 'react-icons/fi';

export default function ManagePage() {
  const [counts, setCounts] = useState({
    applyCount: 0,
    inProgressCount: 0,
    registerReviewCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 대시보드 카운터 정보 로드
  const fetchCounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/counts');

      if (!response.ok) {
        throw new Error('카운터 정보를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setCounts({
        applyCount: data.applyCount || 0,
        inProgressCount: data.inProgressCount || 0,
        registerReviewCount: data.registerReviewCount || 0,
      });
    } catch (err) {
      console.error('카운터 정보 로드 중 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // 5분마다 자동으로 카운터 정보 업데이트 (1분 → 5분으로 변경)
    const intervalId = setInterval(() => {
      fetchCounts();
    }, 300000);

    return () => clearInterval(intervalId);
  }, []);

  // 새로고침 버튼 핸들러
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCounts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <KingOnlySection fallback={<KingFallback />}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">관리자 페이지</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              refreshing || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '새로고침 중...' : '새로고침'}
          </button>
        </div>

        {/* 카운터 정보 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 대기 중인 서비스 신청 */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="px-5 py-4 relative">
              <div className="absolute top-3 right-3 rounded-full bg-yellow-400 bg-opacity-20 p-2">
                <FiServer className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="font-medium text-yellow-800 text-sm">대기 중인 서비스 신청</div>
              <div className="flex items-end gap-1 mt-1">
                <div className="text-3xl font-extrabold text-yellow-700">
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></div>
                  ) : (
                    counts.applyCount
                  )}
                </div>
                <div className="text-xs font-medium text-yellow-600 mb-1 ml-1">건</div>
              </div>
            </div>
          </div>

          {/* 진행 중인 서비스 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="px-5 py-4 relative">
              <div className="absolute top-3 right-3 rounded-full bg-blue-400 bg-opacity-20 p-2">
                <FiClock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="font-medium text-blue-800 text-sm">진행 중인 서비스</div>
              <div className="flex items-end gap-1 mt-1">
                <div className="text-3xl font-extrabold text-blue-700">
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    counts.inProgressCount
                  )}
                </div>
                <div className="text-xs font-medium text-blue-600 mb-1 ml-1">건</div>
              </div>
            </div>
          </div>

          {/* 승인 대기 중인 리뷰 */}
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-100 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="px-5 py-4 relative">
              <div className="absolute top-3 right-3 rounded-full bg-purple-400 bg-opacity-20 p-2">
                <FiStar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="font-medium text-purple-800 text-sm">승인 대기 중인 리뷰</div>
              <div className="flex items-end gap-1 mt-1">
                <div className="text-3xl font-extrabold text-purple-700">
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                  ) : (
                    counts.registerReviewCount
                  )}
                </div>
                <div className="text-xs font-medium text-purple-600 mb-1 ml-1">건</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">관리 메뉴</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/manage/estimates/search"
            className="bg-white hover:bg-blue-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FiFileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">견적 생성/검색</h2>
              <p className="text-gray-600">견적 정보를 생성/검색하고 관리합니다. + 견적서 출력</p>
            </div>
          </Link>

          <Link
            href="/manage/service"
            className="bg-white hover:bg-indigo-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4 relative"
          >
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <FiServer size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">서비스 관리</h2>
              <p className="text-gray-600">고객의 서비스 신청 내역을 확인하고 관리합니다.</p>
            </div>
            {!loading && counts.applyCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md animate">
                {counts.applyCount}
              </span>
            )}
          </Link>

          <Link
            href="/manage/review"
            className="bg-white hover:bg-indigo-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4 relative"
          >
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">리뷰 관리</h2>
              <p className="text-gray-600">고객의 리뷰를 확인하고 관리합니다.</p>
            </div>
            {!loading && counts.registerReviewCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md animate">
                {counts.registerReviewCount}
              </span>
            )}
          </Link>

          <Link
            href="/manage/record/search"
            className="bg-white hover:bg-blue-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-cyan-100 text-cyan-600">
              <FiHardDrive size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                자료/기록 데이터
                <br />
                <span className="text-gray-500 text-sm">(사용권장X, 로직 비효율ㅠㅠ)</span>
              </h2>
              <p className="text-gray-600">자료와 기록 데이터를 관리하고 조회합니다.</p>
            </div>
          </Link>

          <Link
            href="/manage/delete"
            className="bg-white hover:bg-red-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <FiTrash2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">비계약자 일괄삭제</h2>
              <p className="text-gray-600">견적데이터 중 비계약자 데이터를 일괄 삭제합니다.</p>
            </div>
          </Link>

          <a
            href="https://cafe.naver.com/okwellcom"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-green-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FiCoffee size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">네이버 카페 이동</h2>
              <p className="text-gray-600">새 창에서 OK웰컴 네이버 카페를 엽니다.</p>
            </div>
          </a>

          <a
            href="/RCP.zip"
            download
            className="bg-white hover:bg-blue-50 border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-sky-100 text-sky-600">
              <FiDownload size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">크롬 확장 프로그램 다운로드</h2>
              <p className="text-gray-600">크롬 확장 프로그램 파일을 다운로드합니다.</p>
            </div>
          </a>

          {/* 추가 관리 메뉴 */}
        </div>
      </KingOnlySection>
    </div>
  );
}
