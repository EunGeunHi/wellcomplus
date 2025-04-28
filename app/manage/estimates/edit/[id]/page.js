'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import { formatDate } from '@/utils/dateFormat';
import { formatNumber } from '@/utils/numberUtils';
import Link from 'next/link';

export default function EstimateEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 견적 유형 옵션
  const estimateTypeOptions = ['예전데이터', '컴퓨터견적', '프린터견적', '노트북견적', 'AS관련'];

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

  // 필드 변경 핸들러 (고객 정보)
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setEstimate({
      ...estimate,
      customerInfo: {
        ...estimate.customerInfo,
        [name]: value,
      },
    });
  };

  // 결제 정보 변경 핸들러
  const handlePaymentInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue;

    if (type === 'checkbox') {
      processedValue = checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    } else if (name === 'releaseDate') {
      processedValue = value; // 날짜는 문자열로 유지
    } else {
      processedValue = value;
    }

    setEstimate({
      ...estimate,
      paymentInfo: {
        ...estimate.paymentInfo,
        [name]: processedValue,
      },
    });
  };

  // 견적 유형 변경 핸들러
  const handleEstimateTypeChange = (e) => {
    setEstimate({
      ...estimate,
      estimateType: e.target.value,
    });
  };

  // 계약자 여부 변경 핸들러
  const handleContractorChange = (e) => {
    setEstimate({
      ...estimate,
      isContractor: e.target.checked,
    });
  };

  // 견적 설명 변경 핸들러
  const handleDescriptionChange = (e) => {
    setEstimate({
      ...estimate,
      estimateDescription: e.target.value,
    });
  };

  // 상품 정보 변경 핸들러
  const handleTableDataChange = (index, field, value) => {
    const updatedTableData = [...estimate.tableData];
    updatedTableData[index] = {
      ...updatedTableData[index],
      [field]: value,
    };

    setEstimate({
      ...estimate,
      tableData: updatedTableData,
    });
  };

  // 상품 추가 핸들러
  const handleAddProduct = () => {
    const newProduct = {
      category: '',
      productName: '',
      quantity: '',
      price: '',
      productCode: '',
      distributor: '',
      reconfirm: '',
      remarks: '',
    };

    setEstimate({
      ...estimate,
      tableData: [...(estimate.tableData || []), newProduct],
    });
  };

  // 상품 삭제 핸들러
  const handleRemoveProduct = (index) => {
    const updatedTableData = [...estimate.tableData];
    updatedTableData.splice(index, 1);

    setEstimate({
      ...estimate,
      tableData: updatedTableData,
    });
  };

  // 수정된 견적 저장
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirm('견적 정보를 수정하시겠습니까?')) {
      return;
    }

    try {
      setSubmitting(true);

      // 계산된 값들 업데이트 - 서버 측에서 재계산할 수도 있지만, 클라이언트에서 계산된 값을 그대로 유지
      // 여기서는 서버에서 계산된 값을 그대로 유지

      const response = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '견적 수정 중 오류가 발생했습니다.');
      }

      alert('견적이 성공적으로 수정되었습니다.');

      // 캐시 무효화를 위한 추가 조치
      try {
        await fetch('/api/invalidate-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/manage/estimates/search' }),
        });
      } catch (error) {
        console.error('캐시 무효화 요청 실패:', error);
      }

      // 로컬 스토리지에 타임스탬프 저장
      localStorage.setItem('estimatesRefreshTimestamp', Date.now().toString());

      // 상세 페이지로 이동
      const timestamp = new Date().getTime();
      // window.location.href를 사용해 완전히 새로운 페이지 로드 강제
      window.location.href = `/manage/estimates/search?refresh=${timestamp}`;
    } catch (err) {
      console.error('견적 수정 오류:', err);
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 버튼
  const handleCancel = () => {
    if (confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
      router.back();
    }
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
            onClick={() => router.back()}
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
            onClick={() => router.back()}
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
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">견적 정보 수정</h1>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">견적 유형</label>
              <select
                value={estimate.estimateType || ''}
                onChange={handleEstimateTypeChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">선택하세요</option>
                {estimateTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <label className="flex items-center space-x-2 mr-4">
              <input
                type="checkbox"
                checked={estimate.isContractor || false}
                onChange={handleContractorChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">계약자</span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {submitting ? '저장 중...' : '저장하기'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              취소
            </button>
          </div>
        </div>

        {/* 고객 정보 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">고객 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                name="name"
                value={estimate.customerInfo?.name || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">연락처</label>
              <input
                type="text"
                name="phone"
                value={estimate.customerInfo?.phone || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PC번호</label>
              <input
                type="text"
                name="pcNumber"
                value={estimate.customerInfo?.pcNumber || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">계약구분</label>
              <input
                type="text"
                name="contractType"
                value={estimate.customerInfo?.contractType || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">판매형태</label>
              <input
                type="text"
                name="saleType"
                value={estimate.customerInfo?.saleType || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">구입형태</label>
              <input
                type="text"
                name="purchaseType"
                value={estimate.customerInfo?.purchaseType || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">지인 이름</label>
              <input
                type="text"
                name="purchaseTypeName"
                value={estimate.customerInfo?.purchaseTypeName || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">용도</label>
              <input
                type="text"
                name="purpose"
                value={estimate.customerInfo?.purpose || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AS조건</label>
              <input
                type="text"
                name="asCondition"
                value={estimate.customerInfo?.asCondition || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">운영체계</label>
              <input
                type="text"
                name="os"
                value={estimate.customerInfo?.os || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">견적담당</label>
              <input
                type="text"
                name="manager"
                value={estimate.customerInfo?.manager || ''}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <textarea
              name="content"
              value={estimate.customerInfo?.content || ''}
              onChange={handleCustomerInfoChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">견적 설명</label>
            <textarea
              value={estimate.estimateDescription || ''}
              onChange={handleDescriptionChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold pb-2">상품 정보</h2>
            <button
              type="button"
              onClick={handleAddProduct}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              + 상품 추가
            </button>
          </div>

          <div className="overflow-x-auto">
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
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estimate.tableData?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.category || ''}
                        onChange={(e) => handleTableDataChange(index, 'category', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.productName || ''}
                        onChange={(e) =>
                          handleTableDataChange(index, 'productName', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.quantity || ''}
                        onChange={(e) => handleTableDataChange(index, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.price || ''}
                        onChange={(e) => handleTableDataChange(index, 'price', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.productCode || ''}
                        onChange={(e) =>
                          handleTableDataChange(index, 'productCode', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.distributor || ''}
                        onChange={(e) =>
                          handleTableDataChange(index, 'distributor', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.reconfirm || ''}
                        onChange={(e) => handleTableDataChange(index, 'reconfirm', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.remarks || ''}
                        onChange={(e) => handleTableDataChange(index, 'remarks', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
                {(!estimate.tableData || estimate.tableData.length === 0) && (
                  <tr>
                    <td colSpan="9" className="px-3 py-4 text-center text-gray-500">
                      등록된 상품이 없습니다. [상품 추가] 버튼을 클릭하여 상품을 추가하세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">결제 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 결제 세부 정보 */}
            <div className="col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">공임비</label>
                  <input
                    type="number"
                    name="laborCost"
                    value={
                      estimate.paymentInfo?.laborCost !== undefined
                        ? estimate.paymentInfo.laborCost
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">튜닝금액</label>
                  <input
                    type="number"
                    name="tuningCost"
                    value={
                      estimate.paymentInfo?.tuningCost !== undefined
                        ? estimate.paymentInfo.tuningCost
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">세팅비</label>
                  <input
                    type="number"
                    name="setupCost"
                    value={
                      estimate.paymentInfo?.setupCost !== undefined
                        ? estimate.paymentInfo.setupCost
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">보증관리비</label>
                  <input
                    type="number"
                    name="warrantyFee"
                    value={
                      estimate.paymentInfo?.warrantyFee !== undefined
                        ? estimate.paymentInfo.warrantyFee
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">할인</label>
                  <input
                    type="number"
                    name="discount"
                    value={
                      estimate.paymentInfo?.discount !== undefined
                        ? estimate.paymentInfo.discount
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">계약금</label>
                  <input
                    type="number"
                    name="deposit"
                    value={
                      estimate.paymentInfo?.deposit !== undefined
                        ? estimate.paymentInfo.deposit
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="includeVat"
                      checked={estimate.paymentInfo?.includeVat || false}
                      onChange={handlePaymentInfoChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">VAT 포함</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT 비율 (%)</label>
                  <input
                    type="number"
                    name="vatRate"
                    value={
                      estimate.paymentInfo?.vatRate !== undefined
                        ? estimate.paymentInfo.vatRate
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">버림 타입</label>
                  <input
                    type="text"
                    name="roundingType"
                    value={estimate.paymentInfo?.roundingType || ''}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">결제 방법</label>
                  <input
                    type="text"
                    name="paymentMethod"
                    value={estimate.paymentInfo?.paymentMethod || ''}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">배송+설비 비용</label>
                  <input
                    type="number"
                    name="shippingCost"
                    value={
                      estimate.paymentInfo?.shippingCost !== undefined
                        ? estimate.paymentInfo.shippingCost
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">출고일자</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={
                      estimate.paymentInfo?.releaseDate
                        ? new Date(estimate.paymentInfo.releaseDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 계산된 금액 요약 (읽기 전용) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">금액 요약 (자동 계산)</h3>
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
                  <span className="text-gray-600">VAT 금액:</span>
                  <span className="font-medium">
                    {estimate.calculatedValues?.vatAmount !== undefined
                      ? `${formatNumber(estimate.calculatedValues.vatAmount)}원`
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
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-800 font-semibold">최종 결제 금액:</span>
                  <span className="text-blue-600 font-bold text-lg">
                    {estimate.calculatedValues?.finalPayment !== undefined
                      ? `${formatNumber(estimate.calculatedValues.finalPayment)}원`
                      : '-'}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">(금액은 서버에서 자동 계산됩니다)</div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <label className="flex items-center space-x-2 mr-4">
            <input
              type="checkbox"
              checked={estimate.isContractor || false}
              onChange={handleContractorChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">계약자</span>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow"
          >
            {submitting ? '저장 중...' : '저장하기'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow"
          >
            취소
          </button>
        </div>
      </form>
    </KingOnlySection>
  );
}
