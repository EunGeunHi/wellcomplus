'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import { formatNumber } from '@/utils/numberUtils';
import Link from 'next/link';

export default function EstimateCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // 견적 유형 옵션
  const estimateTypeOptions = ['예전데이터', '컴퓨터견적', '프린터견적', '노트북견적', 'AS관련'];

  // 초기 견적 상태 설정
  const [estimate, setEstimate] = useState({
    estimateType: '',
    customerInfo: {
      name: '',
      phone: '',
      pcNumber: '',
      contractType: '일반의뢰',
      saleType: '해당없음',
      purchaseType: '해당없음',
      purchaseTypeName: '',
      purpose: '',
      asCondition: '본인방문조건',
      os: 'win11',
      manager: '김선식',
    },
    tableData: [], // 상품 데이터
    paymentInfo: {
      laborCost: 0,
      tuningCost: 0,
      setupCost: 0,
      warrantyFee: 0,
      discount: 0,
      deposit: 0,
      includeVat: true,
      vatRate: 10,
      roundingType: '',
      paymentMethod: '',
      shippingCost: 0,
      releaseDate: '',
    },
    calculatedValues: {
      productTotal: 0,
      totalPurchase: 0,
      vatAmount: 0,
      finalPayment: 0,
    },
    isContractor: false,
    estimateDescription: '',
  });

  // 고객 정보 변경 핸들러
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
      processedValue = value === '' ? 0 : Number(value);
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
      tableData: [...estimate.tableData, newProduct],
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

  // 견적 저장
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirm('새 견적을 생성하시겠습니까?')) {
      return;
    }

    try {
      setSubmitting(true);

      // 계산된 값 업데이트 - 서버에서 다시 계산
      // 실제 구현 시 클라이언트에서도 계산 로직 추가 가능

      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '견적 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      alert('견적이 성공적으로 생성되었습니다.');

      // 캐시 무효화를 위한 조치
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

      // 검색 페이지로 이동
      const timestamp = new Date().getTime();
      window.location.href = `/manage/estimates/search?refresh=${timestamp}`;
    } catch (err) {
      console.error('견적 생성 오류:', err);
      alert(`생성 실패: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 버튼
  const handleCancel = () => {
    if (confirm('견적 생성을 취소하시겠습니까? 모든 입력 내용이 사라집니다.')) {
      router.back();
    }
  };

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">새 견적 생성</h1>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">견적 유형</label>
              <select
                value={estimate.estimateType}
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
                checked={estimate.isContractor}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                name="name"
                value={estimate.customerInfo.name}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">연락처</label>
              <input
                type="text"
                name="phone"
                value={estimate.customerInfo.phone}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PC번호</label>
              <input
                type="text"
                name="pcNumber"
                value={estimate.customerInfo.pcNumber}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="2504PC"
              />
            </div>
          </div>

          {/* 계약구분 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">계약구분</label>
            <div className="flex flex-wrap gap-2 items-center">
              {['일반의뢰', '직접입력'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        contractType: option === '직접입력' ? '' : option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    (option === '직접입력' && estimate.customerInfo.contractType !== '일반의뢰') ||
                    estimate.customerInfo.contractType === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
              {estimate.customerInfo.contractType !== '일반의뢰' && (
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={estimate.customerInfo.contractType || ''}
                  onChange={(e) => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        contractType: e.target.value,
                      },
                    });
                  }}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              )}
            </div>
          </div>

          {/* 판매형태 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">판매형태</label>
            <div className="flex flex-wrap gap-2 items-center">
              {['부품 조립형', '본인설치', '해당없음', '직접입력'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        saleType: option === '직접입력' ? '' : option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    (option === '직접입력' &&
                      !['부품 조립형', '본인설치', '해당없음'].includes(
                        estimate.customerInfo.saleType
                      )) ||
                    estimate.customerInfo.saleType === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
              {!['부품 조립형', '본인설치', '해당없음'].includes(
                estimate.customerInfo.saleType
              ) && (
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={estimate.customerInfo.saleType || ''}
                  onChange={(e) => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        saleType: e.target.value,
                      },
                    });
                  }}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              )}
            </div>
          </div>

          {/* 구입형태 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">구입형태</label>
            <div className="flex flex-wrap gap-2 items-center">
              {['지인', '기존회원', '해당없음', '직접입력'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        purchaseType: option === '직접입력' ? '' : option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    (option === '직접입력' &&
                      !['지인', '기존회원', '해당없음'].includes(
                        estimate.customerInfo.purchaseType
                      )) ||
                    estimate.customerInfo.purchaseType === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
              {!['지인', '기존회원', '해당없음'].includes(estimate.customerInfo.purchaseType) && (
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={estimate.customerInfo.purchaseType || ''}
                  onChange={(e) => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        purchaseType: e.target.value,
                      },
                    });
                  }}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              )}
            </div>
          </div>

          {/* 지인 이름 - 구입형태가 지인일 때만 표시 */}
          {estimate.customerInfo.purchaseType === '지인' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">지인 이름</label>
              <input
                type="text"
                name="purchaseTypeName"
                value={estimate.customerInfo.purchaseTypeName}
                onChange={handleCustomerInfoChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          )}

          {/* 용도 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">용도</label>
            <div className="flex flex-wrap gap-2 items-center">
              {['게임', '문서작업', '영상/이미지편집', '직접입력'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        purpose: option === '직접입력' ? '' : option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    (option === '직접입력' &&
                      !['게임', '문서작업', '영상/이미지편집'].includes(
                        estimate.customerInfo.purpose
                      )) ||
                    estimate.customerInfo.purpose === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
              {!['게임', '문서작업', '영상/이미지편집'].includes(estimate.customerInfo.purpose) && (
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={estimate.customerInfo.purpose || ''}
                  onChange={(e) => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        purpose: e.target.value,
                      },
                    });
                  }}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              )}
            </div>
          </div>

          {/* AS조건 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">AS조건</label>
            <div className="flex flex-wrap gap-2 items-center">
              {['본인방문조건', '직접입력'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        asCondition: option === '직접입력' ? '' : option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    (option === '직접입력' &&
                      !['본인방문조건'].includes(estimate.customerInfo.asCondition)) ||
                    estimate.customerInfo.asCondition === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
              {!['본인방문조건'].includes(estimate.customerInfo.asCondition) && (
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={estimate.customerInfo.asCondition || ''}
                  onChange={(e) => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        asCondition: e.target.value,
                      },
                    });
                  }}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              )}
            </div>
          </div>

          {/* 운영체계 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">운영체계</label>
            <div className="flex flex-wrap gap-2 items-center">
              {['win10', 'win11', '직접입력'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        os: option === '직접입력' ? '' : option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    (option === '직접입력' &&
                      !['win10', 'win11'].includes(estimate.customerInfo.os)) ||
                    estimate.customerInfo.os === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
              {!['win10', 'win11'].includes(estimate.customerInfo.os) && (
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={estimate.customerInfo.os || ''}
                  onChange={(e) => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        os: e.target.value,
                      },
                    });
                  }}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              )}
            </div>
          </div>

          {/* 견적담당 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">견적담당</label>
            <div className="flex flex-wrap gap-2">
              {['김선식', '소성욱'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEstimate({
                      ...estimate,
                      customerInfo: {
                        ...estimate.customerInfo,
                        manager: option,
                      },
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm ${
                    estimate.customerInfo.manager === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              견적 설명 및 참고사항(견적서에 내용추가 가능)
            </label>
            <textarea
              value={estimate.estimateDescription}
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
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">작업</th>
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
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </td>
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
                  </tr>
                ))}
                {estimate.tableData.length === 0 && (
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
                    value={estimate.paymentInfo.laborCost}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">튜닝금액</label>
                  <input
                    type="number"
                    name="tuningCost"
                    value={estimate.paymentInfo.tuningCost}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">세팅비</label>
                  <input
                    type="number"
                    name="setupCost"
                    value={estimate.paymentInfo.setupCost}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">보증관리비</label>
                  <input
                    type="number"
                    name="warrantyFee"
                    value={estimate.paymentInfo.warrantyFee}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">할인</label>
                  <input
                    type="number"
                    name="discount"
                    value={estimate.paymentInfo.discount}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">계약금</label>
                  <input
                    type="number"
                    name="deposit"
                    value={estimate.paymentInfo.deposit}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="includeVat"
                      checked={estimate.paymentInfo.includeVat}
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
                    value={estimate.paymentInfo.vatRate}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">버림 타입</label>
                  <input
                    type="text"
                    name="roundingType"
                    value={estimate.paymentInfo.roundingType}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">결제 방법</label>
                  <input
                    type="text"
                    name="paymentMethod"
                    value={estimate.paymentInfo.paymentMethod}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">배송+설비 비용</label>
                  <input
                    type="number"
                    name="shippingCost"
                    value={estimate.paymentInfo.shippingCost}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">출고일자</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={estimate.paymentInfo.releaseDate}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 금액 정보 안내 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">금액 정보</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품/부품 합계:</span>
                  <span className="font-medium">저장 시 자동 계산</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT 금액:</span>
                  <span className="font-medium">저장 시 자동 계산</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 구입 금액:</span>
                  <span className="font-medium">저장 시 자동 계산</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-800 font-semibold">최종 결제 금액:</span>
                  <span className="text-blue-600 font-bold text-lg">저장 시 자동 계산</span>
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
              checked={estimate.isContractor}
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
