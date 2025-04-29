// 웰컴플러스 견적 폼 데이터 자동 입력 스크립트
console.log('웰컴플러스 견적 폼 스크립트가 로드되었습니다.');

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('웰컴플러스에서 메시지 수신:', request);

  if (request.action === 'fillEstimateForm') {
    try {
      const { products } = request;
      fillForm(products);
      sendResponse({ success: true, message: '데이터 입력 성공' });
    } catch (error) {
      console.error('데이터 입력 중 오류 발생:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 비동기 응답을 위해 true 반환
  }
});

// 페이지 로드 완료 이벤트
window.addEventListener('load', async () => {
  console.log('웰컴플러스 견적 페이지 로드 완료');

  // 로컬 스토리지에서 데이터 확인
  try {
    const result = await chrome.storage.local.get(['extractedProducts']);
    if (result.extractedProducts && result.extractedProducts.length > 0) {
      console.log('로컬 스토리지에서 상품 데이터 로드:', result.extractedProducts.length + '개');

      // 페이지가 완전히 렌더링될 때까지 잠시 대기
      setTimeout(() => {
        fillForm(result.extractedProducts);
      }, 1500); // 1.5초로 대기 시간 증가
    }
  } catch (error) {
    console.error('스토리지 데이터 로드 중 오류:', error);
  }
});

// 지정한 시간만큼 대기하는 함수
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 폼 필드에 데이터 채우기
async function fillForm(products) {
  if (!products || products.length === 0) {
    console.error('채울 데이터가 없습니다.');
    return;
  }

  console.log('견적 폼 데이터 채우기 시작:', products);

  try {
    // 상품 추가 버튼 찾기 (여러 가지 선택자로 시도)
    let addProductBtn = document.querySelector('button[type="button"][class*="bg-green"]');
    if (!addProductBtn) {
      addProductBtn = Array.from(document.querySelectorAll('button')).find(
        (btn) => btn.textContent.includes('상품 추가') || btn.innerText.includes('상품 추가')
      );
    }

    if (!addProductBtn) {
      console.error('상품 추가 버튼을 찾을 수 없습니다.');
      showNotification(
        '상품 추가 버튼을 찾을 수 없습니다. 페이지 구조가 변경되었을 수 있습니다.',
        true
      );
      return;
    }

    console.log('상품 추가 버튼 발견:', addProductBtn);

    // 기존 상품 테이블 확인
    let tableRows = document.querySelectorAll('table tbody tr');
    console.log('기존 테이블 행:', tableRows.length);

    const emptyTable = tableRows.length === 1 && tableRows[0].querySelector('td[colspan]');
    const initRowCount = emptyTable ? 0 : tableRows.length;

    // 빈 테이블인 경우 첫 번째 행 추가하고 UI가 업데이트될 때까지 대기
    if (emptyTable) {
      console.log('빈 테이블 감지, 첫 번째 행 추가');
      addProductBtn.click();
      await sleep(200); // 200ms 대기
    }

    // 순차적으로 필요한 행 추가 (각 클릭 후 UI 업데이트 대기)
    const rowsNeeded = products.length;
    let currentRows = emptyTable ? 1 : tableRows.length; // 빈 테이블에서 시작하면 첫 행을 이미 추가함

    console.log(`현재 행 수: ${currentRows}, 필요한 행 수: ${rowsNeeded}`);

    // 필요한 만큼 행 추가 (각 추가 사이에 지연 시간 추가)
    for (let i = currentRows; i < rowsNeeded; i++) {
      console.log(`${i + 1}번째 행 추가 중...`);
      addProductBtn.click();
      await sleep(200); // 각 행 추가 후 200ms 대기
    }

    // 모든 행이 추가될 때까지 대기 (최대 10번 확인)
    let attempts = 0;
    let allRowsAdded = false;

    while (!allRowsAdded && attempts < 10) {
      tableRows = document.querySelectorAll('table tbody tr');
      const hasEmptyRow = tableRows.length === 1 && tableRows[0].querySelector('td[colspan]');

      if (!hasEmptyRow && tableRows.length >= rowsNeeded) {
        allRowsAdded = true;
        console.log(`모든 행 추가 완료: ${tableRows.length}개`);
      } else {
        attempts++;
        console.log(`행 추가 확인 중... (${attempts}/10) - 현재 ${tableRows.length}개`);
        await sleep(200);
      }
    }

    if (!allRowsAdded) {
      console.warn(
        `시간 초과: 필요한 모든 행(${rowsNeeded}개)이 추가되지 않았습니다. 현재 ${tableRows.length}개 행이 있습니다.`
      );
    }

    // DOM 업데이트를 위한 추가 지연
    await sleep(500);

    // 업데이트된 행 가져오기
    const updatedRows = document.querySelectorAll('table tbody tr');
    console.log('최종 업데이트된 행 수:', updatedRows.length);

    if (
      updatedRows.length === 0 ||
      (updatedRows.length === 1 && updatedRows[0].querySelector('td[colspan]'))
    ) {
      console.error('상품 행이 생성되지 않았습니다.');
      showNotification(
        '상품 행을 추가할 수 없습니다. 페이지를 새로고침하고 다시 시도하세요.',
        true
      );
      return;
    }

    let successCount = 0;

    // 각 제품에 대해 순차적으로 입력
    for (let index = 0; index < products.length; index++) {
      if (index < updatedRows.length) {
        const row = updatedRows[index];
        const product = products[index];

        if (!row.querySelector('td[colspan]')) {
          //console.log(`제품 ${index + 1} 데이터 입력 중:`, product);
          // 카테고리 조정
          if (product.category === 'SSD') {
            product.category = 'SSD/M.2';
          }

          const inputs = row.querySelectorAll('input');
          if (inputs.length === 0) {
            console.error(`${index + 1}번째 행에 입력 필드가 없습니다:`, row);
            continue;
          }

          // 입력 필드를 인덱스로 식별 (인덱스 기반 접근이 더 안정적임)
          if (inputs.length >= 4) {
            // 필드 순서: 분류, 상품명, 수량, 현금가, ...
            setInputValue(inputs[0], product.category);
            setInputValue(inputs[1], product.productName);
            setInputValue(inputs[2], product.quantity.toString());
            setInputValue(inputs[3], product.price.toString());
            successCount++;
          } else {
            // 대안 방법: name 속성으로 시도
            inputs.forEach((input) => {
              const name = input.getAttribute('name') || '';

              if (name.includes('category')) {
                setInputValue(input, product.category);
              } else if (name.includes('productName')) {
                setInputValue(input, product.productName);
              } else if (name.includes('quantity')) {
                setInputValue(input, product.quantity.toString());
              } else if (name.includes('price')) {
                setInputValue(input, product.price.toString());
              }
            });
            successCount++;
          }

          // 각 입력 후 짧은 지연 추가
          await sleep(50);
        }
      }
    }

    // 성공 메시지 표시
    showNotification(`${successCount}개의 상품 데이터가 성공적으로 입력되었습니다.`);
    console.log(`데이터 입력 완료: ${successCount}/${products.length}`);
  } catch (error) {
    console.error('폼 채우기 중 오류:', error);
    showNotification('데이터 입력 중 오류가 발생했습니다: ' + error.message, true);
  }
}

// 입력 필드 값 설정 및 이벤트 발생
function setInputValue(input, value) {
  if (!input) return;

  // 다양한 방법으로 값 설정 시도
  try {
    // 1. 직접 value 설정
    input.value = value;

    // 2. React의 상태 업데이트를 위한 이벤트 트리거
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // 3. 값이 설정되었는지 확인
    if (input.value !== value) {
      // 속성 재정의를 통한 접근 시도
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set;
      nativeInputValueSetter.call(input, value);
    }

    // 4. 최종 이벤트 재발생
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  } catch (e) {
    console.warn('입력 필드 값 설정 실패:', e);
  }
}

// 알림 표시
function showNotification(message, isError = false) {
  // 기존 알림 제거
  const existingNotification = document.getElementById('danawa-extension-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 새 알림 생성
  const notification = document.createElement('div');
  notification.id = 'danawa-extension-notification';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = isError ? '#F44336' : '#3fd839';
  notification.style.color = 'white';
  notification.style.padding = '16px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.maxWidth = '80%';
  notification.style.textAlign = 'center';
  notification.textContent = message;

  document.body.appendChild(notification);

  // 3초 후 알림 제거
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
