'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import { formatDate } from '@/utils/dateFormat';
import Link from 'next/link';

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/estimates/${id}`);

        if (!response.ok) {
          throw new Error('견적 정보를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setEstimate(data.estimate);
      } catch (err) {
        console.error('견적 상세 조회 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [id]);

  // 뒤로 가기
  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <KingOnlySection fallback={<KingFallback />}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </KingOnlySection>
    );
  }

  if (error) {
    return (
      <KingOnlySection fallback={<KingFallback />}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-4">{error}</div>
          <button
            onClick={handleGoBack}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            뒤로 가기
          </button>
        </div>
      </KingOnlySection>
    );
  }

  if (!estimate) {
    return (
      <KingOnlySection fallback={<KingFallback />}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-yellow-100 p-4 rounded-lg text-yellow-700 mb-4">
            견적 정보를 찾을 수 없습니다.
          </div>
          <button
            onClick={handleGoBack}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            뒤로 가기
          </button>
        </div>
      </KingOnlySection>
    );
  }

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">견적 상세 정보</h1>
            <div className="mt-1 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {estimate.estimateType || '없음'}
            </div>
          </div>
          <button
            onClick={handleGoBack}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            목록으로 돌아가기
          </button>
        </div>

        {/* 고객 정보 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">고객 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">이름</p>
              <p className="font-medium">{estimate.customerInfo.name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">연락처</p>
              <p className="font-medium">{estimate.customerInfo.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">PC번호</p>
              <p className="font-medium">{estimate.customerInfo.pcNumber || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">계약구분</p>
              <p className="font-medium">{estimate.customerInfo.contractType || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">판매형태</p>
              <p className="font-medium">{estimate.customerInfo.saleType || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">구입형태</p>
              <p className="font-medium">{estimate.customerInfo.purchaseType || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">지인 이름</p>
              <p className="font-medium">{estimate.customerInfo.purchaseTypeName || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">용도</p>
              <p className="font-medium">{estimate.customerInfo.purpose || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">AS조건</p>
              <p className="font-medium">{estimate.customerInfo.asCondition || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">운영체계</p>
              <p className="font-medium">{estimate.customerInfo.os || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">견적담당</p>
              <p className="font-medium">{estimate.customerInfo.manager || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">계약자 여부</p>
              <p className="font-medium">{estimate.isContractor ? '계약자' : '미계약자'}</p>
            </div>
          </div>

          {/* 내용 */}
          <div className="mt-4">
            <p className="text-gray-600">내용</p>
            <p className="whitespace-pre-line">{estimate.customerInfo.content || '-'}</p>
          </div>

          {/* 견적설명 */}
          {estimate.estimateDescription && (
            <div className="mt-4">
              <p className="text-gray-600">견적설명</p>
              <p className="whitespace-pre-line">{estimate.estimateDescription}</p>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        {estimate.tableData && estimate.tableData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">상품 정보</h2>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">분류</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">상품명</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">수량</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">현금가</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                    상품코드
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">총판</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">재조사</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estimate.tableData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{item.category || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {item.productName || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{item.quantity || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{item.price || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {item.productCode || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {item.distributor || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{item.reconfirm || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{item.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 생성/수정 정보 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap justify-between text-sm text-gray-500">
            <div>
              <span>생성일: </span>
              <span>
                {estimate.createdAt ? formatDate(estimate.createdAt, { withTime: true }) : '-'}
              </span>
            </div>
            <div>
              <span>최종 수정일: </span>
              <span>
                {estimate.updatedAt ? formatDate(estimate.updatedAt, { withTime: true }) : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </KingOnlySection>
  );
}
