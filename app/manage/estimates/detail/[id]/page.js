'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import { formatDate } from '@/utils/dateFormat';
import { formatNumber } from '@/utils/numberUtils';
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa';

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 진행 중 상태

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

  // 수정 페이지로 이동
  const handleEdit = () => {
    router.push(`/manage/estimates/edit/${id}`);
  };

  // 견적 삭제
  const handleDelete = async () => {
    // 사용자 확인
    const confirmed = window.confirm(
      '정말 이 견적을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/estimates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '견적 삭제 중 오류가 발생했습니다.');
      }

      // 삭제 성공 시 목록 페이지로 이동
      alert('견적이 성공적으로 삭제되었습니다.');

      // 캐시 무효화를 위한 추가 조치
      // 1. 서버로 캐시 무효화 요청
      try {
        await fetch('/api/invalidate-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/manage/estimates/search' }),
        });
      } catch (error) {
        console.error('캐시 무효화 요청 실패:', error);
      }

      // 2. 로컬 스토리지에 타임스탬프 저장 (검색 페이지에서 감지)
      localStorage.setItem('estimatesRefreshTimestamp', Date.now().toString());

      // 3. 타임스탬프 쿼리 추가 및 리디렉션
      const timestamp = new Date().getTime();
      // window.location.href를 사용해 완전히 새로운 페이지 로드 강제
      window.location.href = `/manage/estimates/search?refresh=${timestamp}`;
    } catch (err) {
      console.error('견적 삭제 오류:', err);
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 견적서 페이지로 이동하는 핸들러
  const handleQuoteClick = () => {
    router.push(`/manage/quote/${id}`);
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
      <div className="bg-gray-50 w-full py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="flex">
              <h1 className="text-2xl font-bold mr-2">견적 상세 정보</h1>
              <div className="flex gap-2 mt-1">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {estimate.estimateType || '없음'}
                </div>
                <div
                  className={`inline-block px-3 py-1 ${estimate.isContractor ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} rounded-full text-sm font-semibold`}
                >
                  {estimate.isContractor ? '계약자' : '비계약자'}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-2 md:mt-0">
              <button
                onClick={handleQuoteClick}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
              >
                <FaFileAlt className="mr-1" /> 견적서 인쇄
              </button>
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={isDeleting}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={handleGoBack}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">고객 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-gray-600">견적설명(견적서에 표시되는 내용)</p>
                <p className="whitespace-pre-line">{estimate.estimateDescription}</p>
              </div>
            )}

            {/* 참고사항항 */}
            {estimate.notes && (
              <div className="mt-4">
                <p className="text-gray-600">참고사항(견적서에 포함되지 않는 내용)</p>
                <p className="whitespace-pre-line">{estimate.notes}</p>
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
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                      상품명
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">수량</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                      현금가
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                      상품코드
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">총판</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                      재조사
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estimate.tableData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.category || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.productName || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.quantity || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.price ? formatNumber(item.price) : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.productCode || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.distributor || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.reconfirm || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{item.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 서비스 물품 정보 */}
          {estimate.serviceData && estimate.serviceData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-6 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">서비스 물품 정보</h2>
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                      상품명
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">수량</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estimate.serviceData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.productName || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {item.quantity || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{item.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 결제 정보 */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">결제 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 결제 세부 정보 */}
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">공임비</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.laborCost !== undefined
                        ? `${formatNumber(estimate.paymentInfo.laborCost)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">튜닝금액</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.tuningCost !== undefined
                        ? `${formatNumber(estimate.paymentInfo.tuningCost)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">세팅비</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.setupCost !== undefined
                        ? `${formatNumber(estimate.paymentInfo.setupCost)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">보증관리비</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.warrantyFee !== undefined
                        ? `${formatNumber(estimate.paymentInfo.warrantyFee)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">할인</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.discount !== undefined
                        ? `${formatNumber(estimate.paymentInfo.discount)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">계약금</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.deposit !== undefined
                        ? `${formatNumber(estimate.paymentInfo.deposit)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">VAT 포함 여부</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.includeVat !== undefined
                        ? estimate.paymentInfo.includeVat
                          ? 'VAT 포함'
                          : 'VAT 미포함'
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">VAT 비율</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.vatRate !== undefined
                        ? `${estimate.paymentInfo.vatRate}%`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">버림 타입</p>
                    <p className="font-medium">{estimate.paymentInfo?.roundingType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">결제 방법</p>
                    <p className="font-medium">{estimate.paymentInfo?.paymentMethod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">배송+설비 비용</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.shippingCost !== undefined
                        ? `${formatNumber(estimate.paymentInfo.shippingCost)}원`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">출고일자</p>
                    <p className="font-medium">
                      {estimate.paymentInfo?.releaseDate
                        ? formatDate(estimate.paymentInfo.releaseDate)
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 계산된 금액 요약 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">금액 요약</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품/부품 합계:</span>
                    <span className="font-medium">
                      {estimate.calculatedValues?.productTotal !== undefined
                        ? `${formatNumber(estimate.calculatedValues.productTotal)}원`
                        : '-'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">총 구입 금액:</span>
                    <span className="font-medium">
                      {estimate.calculatedValues?.totalPurchase !== undefined
                        ? `${formatNumber(estimate.calculatedValues.totalPurchase)}원`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT 금액:</span>
                    <span className="font-medium">
                      {estimate.calculatedValues?.vatAmount !== undefined
                        ? `${formatNumber(estimate.calculatedValues.vatAmount)}원`
                        : '-'}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-800 font-semibold">최종 결제 금액:</span>
                    <span className="text-blue-600 font-bold text-lg">
                      {estimate.calculatedValues?.finalPayment !== undefined
                        ? `${formatNumber(estimate.calculatedValues.finalPayment)}원`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 생성/수정 정보 */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
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

          {/* 하단 버튼 영역 */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleQuoteClick}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow flex items-center justify-center"
            >
              <FaFileAlt className="mr-1" /> 견적서 인쇄
            </button>
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow"
              disabled={isDeleting}
            >
              수정하기
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow"
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제하기'}
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </KingOnlySection>
  );
}
