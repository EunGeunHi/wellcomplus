'use client';

import { useState, useEffect } from 'react';
import { globalTracker } from '@/lib/blob-optimization';

/**
 * Blob Storage Advanced Operations 사용량 모니터링 컴포넌트
 * 실시간으로 사용량을 추적하고 비용을 예측
 */
export default function BlobUsageMonitor({ showDetails = false }) {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(globalTracker.getStats());
    };

    // 초기 로드
    updateStats();

    // 30초마다 업데이트로 변경 (5초 → 30초)
    const interval = setInterval(updateStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!stats || (!showDetails && stats.totalAdvancedOps === 0)) {
    return null;
  }

  const getCostColor = (cost) => {
    if (cost === 0) return 'text-green-600';
    if (cost < 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsagePercentage = () => {
    const freeLimit = 10000;
    return Math.min((stats.totalAdvancedOps / freeLimit) * 100, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        📊 Blob 사용량 {stats.totalAdvancedOps > 0 && `(${stats.totalAdvancedOps})`}
      </button>

      {/* 상세 정보 패널 */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Blob Storage 사용량</h3>
            <button
              onClick={() => globalTracker.reset()}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              리셋
            </button>
          </div>

          {/* 전체 사용량 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Advanced Operations</span>
              <span className="text-sm font-medium">{stats.totalAdvancedOps.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getUsagePercentage()}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              무료 한도: 10,000회 ({(100 - getUsagePercentage()).toFixed(1)}% 남음)
            </div>
          </div>

          {/* 예상 비용 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">예상 비용</span>
              <span className={`text-lg font-bold ${getCostColor(stats.estimatedCost)}`}>
                ${stats.estimatedCost.toFixed(4)}
              </span>
            </div>
            {stats.estimatedCost > 0 && (
              <div className="text-xs text-gray-500 mt-1">무료 한도 초과분에 대한 예상 비용</div>
            )}
          </div>

          {/* 세부 작업 내역 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">작업 내역</h4>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">업로드 (PUT):</span>
                <span className="font-medium">{stats.operations.put}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">삭제 (DEL):</span>
                <span className="font-medium">{stats.operations.del}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">목록 (LIST):</span>
                <span className="font-medium">{stats.operations.list}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">헤더 (HEAD):</span>
                <span className="font-medium text-green-600">{stats.operations.head}</span>
              </div>
            </div>
          </div>

          {/* 세션 정보 */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              세션 시간: {Math.floor(stats.duration / 60)}분 {stats.duration % 60}초
            </div>
          </div>

          {/* 최적화 팁 */}
          {stats.totalAdvancedOps > 5000 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xs text-yellow-800">
                <strong>💡 최적화 팁:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• 불필요한 파일 삭제 작업 줄이기</li>
                  <li>• 배치 업로드 시 순차 처리 사용</li>
                  <li>• 중복 파일 업로드 방지</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 관리자 전용 상세 사용량 모니터 컴포넌트
 */
export function AdminBlobUsageMonitor() {
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    try {
      // API 호출 비활성화 - Advanced Operations 사용량 절약
      // const response = await fetch('/api/admin/blob-usage');
      // if (response.ok) {
      //   const data = await response.json();
      //   setMonthlyStats(data);
      // }

      // 임시로 빈 데이터 설정
      setMonthlyStats({});
    } catch (error) {
      console.error('월간 사용량 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">월간 Blob Storage 사용량 분석</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {globalTracker.getStats().totalAdvancedOps.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600">이번 세션 Advanced Ops</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${globalTracker.getStats().estimatedCost.toFixed(2)}
          </div>
          <div className="text-sm text-green-600">예상 추가 비용</div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {(10000 - globalTracker.getStats().totalAdvancedOps).toLocaleString()}
          </div>
          <div className="text-sm text-yellow-600">남은 무료 한도</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">최적화 권장사항</h4>

        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              클라이언트 업로드 방식 사용으로 서버 부하 감소
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              순차 삭제 처리로 rate limiting 방지
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">⚠</span>
              대용량 파일 업로드 시 multipart 업로드 최적화 필요
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">⚠</span>
              불필요한 파일 삭제 작업 최소화 권장
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
