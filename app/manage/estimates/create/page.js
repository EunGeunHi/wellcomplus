'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import { formatNumber } from '@/utils/numberUtils';
import Link from 'next/link';

export default function EstimateCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', show: false, fadeOut: false });
  const [focusedInput, setFocusedInput] = useState(null);

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

    serviceData: [], // 서비스 물품 데이터

    // 결제 정보
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

  // 직접 입력 UI 상태 관리를 위한 별도의 상태
  const [isPaymentMethodDirectInput, setIsPaymentMethodDirectInput] = useState(false);
  // 각 필드별 직접 입력 상태 관리
  const [directInputFields, setDirectInputFields] = useState({
    laborCost: false,
    tuningCost: false,
    setupCost: false,
    warrantyFee: false,
  });

  // 계산 로직을 수행하는 순수 함수 - 별도로 분리하여 재사용 가능
  const calculateEstimateValues = (estimateData) => {
    // 상품 합계 계산
    const productTotal = estimateData.tableData.reduce((total, item) => {
      // 현금가에서 콤마와 원 제거 후 숫자로 변환
      const price = item.price
        ? Number(item.price.toString().replace(/,/g, '').replace('원', ''))
        : 0;
      return total + price;
    }, 0);

    // 추가 비용 계산
    const additionalCosts =
      (estimateData.paymentInfo.laborCost || 0) +
      (estimateData.paymentInfo.tuningCost || 0) +
      (estimateData.paymentInfo.setupCost || 0) +
      (estimateData.paymentInfo.warrantyFee || 0) -
      (estimateData.paymentInfo.discount || 0);

    // 총 구입 금액
    let totalPurchase = productTotal + additionalCosts;

    // roundingType에 따라 totalPurchase 값 처리
    const roundingType = estimateData.paymentInfo.roundingType;
    if (roundingType) {
      let divisor = 100; // 기본값
      if (roundingType === '100down') divisor = 100;
      else if (roundingType === '1000down') divisor = 1000;
      else if (roundingType === '10000down') divisor = 10000;

      // 해당 단위로 나눈 몫 계산 (버림 처리)
      const quotient = Math.floor(totalPurchase / divisor);
      totalPurchase = quotient * divisor;
    }

    // VAT 계산
    const vatRate = (estimateData.paymentInfo.vatRate || 10) / 100;
    let vatAmount = 0;

    // VAT 포함 여부에 따른 계산
    if (estimateData.paymentInfo.includeVat) {
      // VAT 체크 함
      vatAmount = Math.round(totalPurchase * vatRate);
    } else {
      // VAT 체크 안함함
      vatAmount = 0;
    }

    //VAT 포함한한 최종 결제 금액 계산
    const finalPayment = totalPurchase + vatAmount;

    // 계산된 값 반환
    return {
      productTotal,
      vatAmount,
      totalPurchase,
      finalPayment,
    };
  };

  // 금액 계산을 위한 useEffect
  useEffect(() => {
    calculateValues();
  }, [estimate.tableData, estimate.paymentInfo]);

  // 금액 계산 함수 - UI 상태 업데이트
  const calculateValues = () => {
    try {
      // 재사용 가능한 함수를 호출하여 계산
      const calculatedValues = calculateEstimateValues(estimate);

      // 계산된 값으로 상태 업데이트
      setEstimate((prev) => ({
        ...prev,
        calculatedValues,
      }));
    } catch (error) {
      console.error('금액 계산 중 오류 발생:', error);
    }
  };

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

  // 결제 정보 금액 버튼 클릭 핸들러
  const handlePaymentButtonClick = (field, amount) => {
    // 현재 값이 이미 해당 금액이면 0으로 리셋, 아니면 해당 금액으로 설정
    const currentAmount = estimate.paymentInfo[field] || 0;
    const newAmount = currentAmount === amount ? 0 : amount;

    setEstimate({
      ...estimate,
      paymentInfo: {
        ...estimate.paymentInfo,
        [field]: newAmount,
      },
    });
  };

  // 직접입력 버튼 핸들러
  const handleDirectInputClick = (field) => {
    // 직접입력 상태 토글
    const isDirectInputMode = !directInputFields[field];

    // 직접입력 상태 업데이트
    setDirectInputFields({
      ...directInputFields,
      [field]: isDirectInputMode,
    });

    // 직접입력이 해제될 때 값 초기화
    if (!isDirectInputMode) {
      setEstimate({
        ...estimate,
        paymentInfo: {
          ...estimate.paymentInfo,
          [field]: 0,
        },
      });
    }
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

  // 서비스 상품 정보 변경 핸들러
  const handleServiceDataChange = (index, field, value) => {
    const updatedServiceData = [...estimate.serviceData];
    updatedServiceData[index] = {
      ...updatedServiceData[index],
      [field]: value,
    };

    setEstimate({
      ...estimate,
      serviceData: updatedServiceData,
    });
  };

  // 서비스 상품 추가 핸들러
  const handleAddServiceItem = () => {
    const newServiceItem = {
      productName: '',
      quantity: '',
      remarks: '',
    };

    setEstimate({
      ...estimate,
      serviceData: [...estimate.serviceData, newServiceItem],
    });
  };

  // 빠른 서비스 상품 추가 핸들러
  const handleQuickAddServiceItem = (itemName) => {
    const newServiceItem = {
      productName: itemName,
      quantity: '1',
      remarks: '',
    };

    setEstimate({
      ...estimate,
      serviceData: [...estimate.serviceData, newServiceItem],
    });

    // 알림 메시지 표시
    showNotification(`'${itemName}' 서비스 상품이 추가되었습니다.`);
  };

  // 서비스 상품 삭제 핸들러
  const handleRemoveServiceItem = (index) => {
    const updatedServiceData = [...estimate.serviceData];
    updatedServiceData.splice(index, 1);

    setEstimate({
      ...estimate,
      serviceData: updatedServiceData,
    });
  };

  // 알림 메시지 표시 함수
  const showNotification = (message) => {
    // 이미 메시지가 표시 중이라면 먼저 제거
    if (notification.show) {
      setNotification({ message: '', show: false, fadeOut: false });
      setTimeout(() => {
        showNotificationWithEffect(message);
      }, 100);
    } else {
      showNotificationWithEffect(message);
    }
  };

  const showNotificationWithEffect = (message) => {
    // 메시지 표시
    setNotification({ message, show: true, fadeOut: false });

    // 2.5초 후 fadeOut 효과 시작
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, fadeOut: true }));

      // 0.5초의 fadeOut 효과 후 메시지 완전히 제거
      setTimeout(() => {
        setNotification({ message: '', show: false, fadeOut: false });
      }, 500);
    }, 2500);
  };

  // 상품 일괄 입력 처리 핸들러
  const handleBulkProductInput = () => {
    const bulkInput = document.getElementById('bulkProductInput').value.trim();

    if (!bulkInput) {
      showNotification('입력된 데이터가 없습니다.');
      return;
    }

    try {
      const lines = bulkInput.split('\n').filter((line) => line.trim() !== '');
      const firstLine = lines[0];
      const tabCount = (firstLine.match(/\t/g) || []).length + 1;

      let newProducts = [];

      // 다나와 형식 (탭이 7개 이상의 데이터)
      if (tabCount >= 7) {
        console.log('다나와 형식 감지됨');

        lines.forEach((line) => {
          const parts = line.split('\t');
          if (parts.length >= 7) {
            let category = parts[0];
            if (category === 'SSD') {
              category = 'SSD/M.2';
            }
            const productName = parts[1];
            const quantity = parts[2];
            // 현금최저가 합계에서 콤마와 '원' 제거
            const price = parts[6].replace(/,/g, '').replace('원', '');

            newProducts.push({
              category,
              productName,
              quantity,
              price,
              productCode: '',
              distributor: '',
              reconfirm: '',
              remarks: '',
            });
          }
        });
      }
      // 견적왕 형식 (4줄이 하나의 상품)
      else if (lines.length >= 4) {
        console.log('견적왕 형식 감지됨');

        for (let i = 0; i < lines.length; i += 4) {
          if (i + 3 < lines.length) {
            const firstLine = lines[i].split('\t');
            const fourthLine = lines[i + 3];

            if (firstLine.length >= 3) {
              const category = firstLine[1];
              const productName = firstLine[3];
              const quantity = lines[i + 2].trim();
              // 합계가격에서 콤마와 '원' 제거
              const price = fourthLine.replace(/,/g, '').replace('원', '');

              newProducts.push({
                category,
                productName,
                quantity,
                price,
                productCode: '',
                distributor: '',
                reconfirm: '',
                remarks: '',
              });
            }
          }
        }
      } else {
        throw new Error('지원되지 않는 데이터 형식입니다.');
      }

      if (newProducts.length > 0) {
        setEstimate({
          ...estimate,
          tableData: [...estimate.tableData, ...newProducts],
        });

        // 입력 성공 후 textarea 비우기
        document.getElementById('bulkProductInput').value = '';
        showNotification(`${newProducts.length}개의 상품이 추가되었습니다.`);
      } else {
        showNotification('추가할 상품 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('데이터 처리 중 오류 발생:', error);
      showNotification('데이터 처리 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 견적 저장
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirm('새 견적을 생성하시겠습니까?')) {
      return;
    }

    try {
      setSubmitting(true);

      // 서버에 데이터 전송 - 현재 상태 그대로 사용
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

  // 포커스 이벤트 핸들러
  const handleFocus = (index, field) => {
    setFocusedInput(`${index}-${field}`);
  };

  // 포커스 아웃 이벤트 핸들러
  const handleBlur = () => {
    setFocusedInput(null);
  };

  // 버림 타입 변경 핸들러
  const handleRoundingTypeClick = (type) => {
    // 이미 선택된 타입이면 선택 해제(빈 문자열로 설정), 아니면 해당 타입으로 설정
    const newType = estimate.paymentInfo.roundingType === type ? '' : type;

    // 타입이 선택 해제되었으면 추가 처리 없이 상태만 업데이트
    if (newType === '') {
      // 서비스 물품 중 "끝자리DC"로 시작하는 항목 제거
      const filteredServiceData = estimate.serviceData.filter(
        (item) => !item.productName.startsWith('끝자리DC')
      );

      setEstimate({
        ...estimate,
        paymentInfo: {
          ...estimate.paymentInfo,
          roundingType: newType,
        },
        serviceData: filteredServiceData, // 필터링된 서비스 물품 목록으로 업데이트
      });

      // 알림 메시지 표시
      showNotification('버림 타입이 해제되었습니다. 관련 끝자리DC 항목이 제거되었습니다.');
      return;
    }

    // 현재 totalPurchase 값 가져오기
    const currentTotal = estimate.calculatedValues.totalPurchase;

    // 버림 단위 설정
    let divisor = 100; // 기본값: 백단위
    if (type === '1000down') divisor = 1000;
    if (type === '10000down') divisor = 10000;

    // 해당 단위로 나눈 몫 계산 (버림 처리)
    const quotient = Math.floor(currentTotal / divisor);
    const roundedTotal = quotient * divisor;

    // 버려진 나머지 금액 계산
    const remainder = currentTotal - roundedTotal;

    // 기존 서비스 물품 중 "끝자리DC"로 시작하는 항목 모두 제거
    const filteredServiceData = estimate.serviceData.filter(
      (item) => !item.productName.startsWith('끝자리DC')
    );

    // 서비스 물품에 추가할 항목 생성
    const newServiceItem = {
      productName: `끝자리DC -${formatNumber(remainder)}원`,
      quantity: '1',
      remarks: '',
    };

    // 상태 업데이트: roundingType 설정 및 서비스 물품 추가
    setEstimate((prev) => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        roundingType: newType,
      },
      serviceData: [...filteredServiceData, newServiceItem], // 기존 DC 항목 제거 후 새 항목 추가
    }));

    // 알림 메시지 표시
    showNotification(`${divisor}원 단위 버림 처리 완료. 끝자리 DC가 서비스 물품에 추가되었습니다.`);
  };

  // 결제 방법 선택 핸들러
  const handlePaymentMethodClick = (method) => {
    // 일반 결제 방법 버튼을 클릭한 경우
    if (method !== '직접입력') {
      // 이미 선택된 방법이면 선택 해제(빈 문자열로 설정), 아니면 해당 방법으로 설정
      const newMethod = estimate.paymentInfo.paymentMethod === method ? '' : method;

      setEstimate({
        ...estimate,
        paymentInfo: {
          ...estimate.paymentInfo,
          paymentMethod: newMethod,
        },
      });

      // 직접 입력 모드 해제
      setIsPaymentMethodDirectInput(false);
    } else {
      // 직접입력 버튼을 클릭한 경우
      const newDirectInputMode = !isPaymentMethodDirectInput;

      // 직접 입력 모드 토글
      setIsPaymentMethodDirectInput(newDirectInputMode);

      // 직접 입력 모드를 해제할 때 paymentMethod 값 초기화
      if (!newDirectInputMode) {
        setEstimate({
          ...estimate,
          paymentInfo: {
            ...estimate.paymentInfo,
            paymentMethod: '',
          },
        });
      }
    }
  };

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
        {/* 알림 메시지 표시 영역 - 상단 가운데 위치로 변경 */}
        {notification.show && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg ${
              notification.fadeOut ? 'opacity-0' : 'opacity-100'
            } transition-opacity duration-500`}
          >
            {notification.message}
          </div>
        )}

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

            <div className="flex items-center gap-3">
              <textarea
                id="bulkProductInput"
                rows="1"
                placeholder="일괄 입력 형식으로 입력해주세요.(다나와, 견적왕)"
                className="w-[400px] border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              ></textarea>
              <button
                type="button"
                onClick={handleBulkProductInput}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
              >
                일괄 입력하기
              </button>
              <button
                type="button"
                onClick={handleAddProduct}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
              >
                + 상품 추가
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center w-[40px]">
                    작업
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center w-[100px]">
                    분류
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center w-[200px]">
                    상품명
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center w-[50px]">
                    수량
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center w-[110px]">
                    현금가
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                    상품코드
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                    총판
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                    재조사
                  </th>
                  <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estimate.tableData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-1 py-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        className="text-base text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.category || ''}
                        onChange={(e) => handleTableDataChange(index, 'category', e.target.value)}
                        onFocus={() => handleFocus(index, 'category')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-category` ? 'w-[150px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.productName || ''}
                        onChange={(e) =>
                          handleTableDataChange(index, 'productName', e.target.value)
                        }
                        onFocus={() => handleFocus(index, 'productName')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-productName` ? 'w-[500px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.quantity || ''}
                        onChange={(e) => handleTableDataChange(index, 'quantity', e.target.value)}
                        onFocus={() => handleFocus(index, 'quantity')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-quantity` ? 'w-[65px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.price || ''}
                        onChange={(e) => handleTableDataChange(index, 'price', e.target.value)}
                        onFocus={() => handleFocus(index, 'price')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-price` ? 'w-[150px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.productCode || ''}
                        onChange={(e) =>
                          handleTableDataChange(index, 'productCode', e.target.value)
                        }
                        onFocus={() => handleFocus(index, 'productCode')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-productCode` ? 'w-[350px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.distributor || ''}
                        onChange={(e) =>
                          handleTableDataChange(index, 'distributor', e.target.value)
                        }
                        onFocus={() => handleFocus(index, 'distributor')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-distributor` ? 'w-[250px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        value={item.reconfirm || ''}
                        onChange={(e) => handleTableDataChange(index, 'reconfirm', e.target.value)}
                        onFocus={() => handleFocus(index, 'reconfirm')}
                        onBlur={handleBlur}
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-100 ${
                          focusedInput === `${index}-reconfirm` ? 'w-[250px]' : 'w-full'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <textarea
                        value={item.remarks || ''}
                        onChange={(e) => handleTableDataChange(index, 'remarks', e.target.value)}
                        onFocus={() => handleFocus(index, 'remarks')}
                        onBlur={handleBlur}
                        rows="1"
                        className={`border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm transition-all duration-200 ${
                          focusedInput === `${index}-remarks`
                            ? 'w-[250px] h-[60px]'
                            : 'w-full h-[30px] overflow-hidden'
                        }`}
                      ></textarea>
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

        {/* 서비스 물품 정보 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold pb-2">서비스 물품 정보</h2>
            <button
              type="button"
              onClick={handleAddServiceItem}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              + 서비스 상품 추가
            </button>
          </div>

          <div className="flex gap-4">
            <div className="w-60">
              <h3 className="text-sm font-medium text-gray-700 mb-2">자주 사용 상품</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAddServiceItem('마우스')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded text-sm w-full text-center"
                >
                  마우스
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddServiceItem('마우스패드')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded text-sm w-full text-center"
                >
                  마우스패드
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddServiceItem('키보드')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded text-sm w-full text-center"
                >
                  키보드
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddServiceItem('스피커')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded text-sm w-full text-center"
                >
                  스피커
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddServiceItem('케이블')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded text-sm w-full text-center"
                >
                  케이블
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                        작업
                      </th>
                      <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                        상품명
                      </th>
                      <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center w-[45px]">
                        수량
                      </th>
                      <th className="px-1 py-1 text-left text-sm font-medium text-gray-500 text-center">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {estimate.serviceData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceItem(index)}
                            className="text-base text-red-500 hover:text-red-700"
                          >
                            삭제
                          </button>
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            value={item.productName || ''}
                            onChange={(e) =>
                              handleServiceDataChange(index, 'productName', e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            value={item.quantity || ''}
                            onChange={(e) =>
                              handleServiceDataChange(index, 'quantity', e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <textarea
                            value={item.remarks || ''}
                            onChange={(e) =>
                              handleServiceDataChange(index, 'remarks', e.target.value)
                            }
                            rows="1"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm h-[30px]"
                          ></textarea>
                        </td>
                      </tr>
                    ))}
                    {estimate.serviceData.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                          등록된 서비스 상품이 없습니다. [서비스 상품 추가] 버튼을 클릭하여 서비스
                          상품을 추가하세요.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">결제 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 결제 세부 정보 */}
            <div className="col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 공임비 */}
                <div className="border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-1">공임비</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[10000, 20000, 30000, 40000, 50000].map((amount) => (
                      <button
                        key={`laborCost-${amount}`}
                        type="button"
                        onClick={() => handlePaymentButtonClick('laborCost', amount)}
                        className={`px-3 py-1 rounded-md text-xs ${
                          estimate.paymentInfo.laborCost === amount
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {amount / 10000}만원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDirectInputClick('laborCost')}
                      className={`px-3 py-1 rounded-md text-xs ${
                        directInputFields.laborCost
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      직접입력
                    </button>
                  </div>
                  {directInputFields.laborCost ? (
                    <input
                      type="number"
                      name="laborCost"
                      value={estimate.paymentInfo.laborCost}
                      onChange={handlePaymentInfoChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="block w-full py-2 px-0">
                      <span className="text-gray-700">
                        {formatNumber(estimate.paymentInfo.laborCost || 0)}원
                      </span>
                    </div>
                  )}
                </div>

                {/* 튜닝금액 */}
                <div className="border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-1">튜닝금액</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[10000, 20000, 30000, 40000, 50000].map((amount) => (
                      <button
                        key={`tuningCost-${amount}`}
                        type="button"
                        onClick={() => handlePaymentButtonClick('tuningCost', amount)}
                        className={`px-3 py-1 rounded-md text-xs ${
                          estimate.paymentInfo.tuningCost === amount
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {amount / 10000}만원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDirectInputClick('tuningCost')}
                      className={`px-3 py-1 rounded-md text-xs ${
                        directInputFields.tuningCost
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      직접입력
                    </button>
                  </div>
                  {directInputFields.tuningCost ? (
                    <input
                      type="number"
                      name="tuningCost"
                      value={estimate.paymentInfo.tuningCost}
                      onChange={handlePaymentInfoChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="block w-full py-2 px-0">
                      <span className="text-gray-700">
                        {formatNumber(estimate.paymentInfo.tuningCost || 0)}원
                      </span>
                    </div>
                  )}
                </div>

                {/* 세팅비 */}
                <div className="border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-1">세팅비</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[10000, 20000, 30000, 40000, 50000].map((amount) => (
                      <button
                        key={`setupCost-${amount}`}
                        type="button"
                        onClick={() => handlePaymentButtonClick('setupCost', amount)}
                        className={`px-3 py-1 rounded-md text-xs ${
                          estimate.paymentInfo.setupCost === amount
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {amount / 10000}만원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDirectInputClick('setupCost')}
                      className={`px-3 py-1 rounded-md text-xs ${
                        directInputFields.setupCost
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      직접입력
                    </button>
                  </div>
                  {directInputFields.setupCost ? (
                    <input
                      type="number"
                      name="setupCost"
                      value={estimate.paymentInfo.setupCost}
                      onChange={handlePaymentInfoChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="block w-full py-2 px-0">
                      <span className="text-gray-700">
                        {formatNumber(estimate.paymentInfo.setupCost || 0)}원
                      </span>
                    </div>
                  )}
                </div>

                {/* 보증관리비 */}
                <div className="border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-1">보증관리비</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[10000, 20000, 30000, 40000, 50000].map((amount) => (
                      <button
                        key={`warrantyFee-${amount}`}
                        type="button"
                        onClick={() => handlePaymentButtonClick('warrantyFee', amount)}
                        className={`px-3 py-1 rounded-md text-xs ${
                          estimate.paymentInfo.warrantyFee === amount
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {amount / 10000}만원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDirectInputClick('warrantyFee')}
                      className={`px-3 py-1 rounded-md text-xs ${
                        directInputFields.warrantyFee
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      직접입력
                    </button>
                  </div>
                  {directInputFields.warrantyFee ? (
                    <input
                      type="number"
                      name="warrantyFee"
                      value={estimate.paymentInfo.warrantyFee}
                      onChange={handlePaymentInfoChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="block w-full py-2 px-0">
                      <span className="text-gray-700">
                        {formatNumber(estimate.paymentInfo.warrantyFee || 0)}원
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">할인</label>
                  <input
                    type="number"
                    name="discount"
                    value={estimate.paymentInfo.discount === 0 ? '' : estimate.paymentInfo.discount}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">계약금</label>
                  <input
                    type="number"
                    name="deposit"
                    value={estimate.paymentInfo.deposit === 0 ? '' : estimate.paymentInfo.deposit}
                    onChange={handlePaymentInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">버림 타입</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { value: '100down', label: '백단위 버림' },
                      { value: '1000down', label: '천단위 버림' },
                      { value: '10000down', label: '만단위 버림' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRoundingTypeClick(option.value)}
                        className={`px-4 py-2 rounded-md text-sm ${
                          estimate.paymentInfo.roundingType === option.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">결제 방법</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['카드', '카드결제 DC', '현금', '직접입력'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handlePaymentMethodClick(method)}
                        className={`px-4 py-2 rounded-md text-sm ${
                          (method === '직접입력' && isPaymentMethodDirectInput) ||
                          (method !== '직접입력' && estimate.paymentInfo.paymentMethod === method)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                  {isPaymentMethodDirectInput && (
                    <input
                      type="text"
                      name="paymentMethod"
                      value={estimate.paymentInfo.paymentMethod}
                      onChange={handlePaymentInfoChange}
                      placeholder="결제 방법 입력"
                      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
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
                  <span className="font-medium">
                    {formatNumber(estimate.calculatedValues.productTotal || 0)}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT 금액:</span>
                  <span className="font-medium">
                    {formatNumber(estimate.calculatedValues.vatAmount || 0)}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 구입 금액:</span>
                  <span className="font-medium">
                    {formatNumber(estimate.calculatedValues.totalPurchase || 0)}원
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-800 font-semibold">최종 결제 금액:</span>
                  <span className="text-blue-600 font-bold text-lg">
                    {formatNumber(estimate.calculatedValues.finalPayment || 0)}원
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">(금액은 실시간으로 계산됩니다)</div>
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
