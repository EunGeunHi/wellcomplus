// 다나와 견적 추출 팝업 스크립트
document.addEventListener('DOMContentLoaded', function () {
  // 요소 참조
  const extractBtn = document.getElementById('extractBtn');
  const sendBtn = document.getElementById('sendBtn');
  const statusElement = document.getElementById('status');

  // 추출된 상품 데이터 저장
  let extractedProducts = [];

  // 상태 업데이트 함수
  function updateStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? '#d93025' : '#333';
    statusElement.style.backgroundColor = isError ? '#fce8e6' : '#f5f5f5';
  }

  // 현재 탭이 다나와 견적 페이지인지 확인
  async function checkCurrentTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url || '';

      if (url.includes('shop.danawa.com/virtualestimate')) {
        return true;
      } else {
        updateStatus('다나와 PC 견적 페이지에서만 사용할 수 있습니다.', true);
        extractBtn.disabled = true;
        return false;
      }
    } catch (error) {
      console.error('탭 확인 중 오류:', error);
      updateStatus('오류가 발생했습니다: ' + error.message, true);
      return false;
    }
  }

  // 초기 탭 확인
  checkCurrentTab();

  // 견적 데이터 추출 이벤트
  extractBtn.addEventListener('click', async function () {
    try {
      updateStatus('견적 데이터 추출 중...');

      // 현재 활성 탭 가져오기
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];

      // 콘텐츠 스크립트에 메시지 보내기
      const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'extractData' });

      if (response.success) {
        extractedProducts = response.data;
        updateStatus(`${response.count}개의 상품 데이터를 추출했습니다.`);

        // 전송 버튼 활성화
        sendBtn.disabled = false;

        // 로컬 스토리지에 데이터 저장
        chrome.storage.local.set({ extractedProducts });
      } else {
        updateStatus('데이터 추출 실패: ' + response.error, true);
      }
    } catch (error) {
      console.error('데이터 추출 중 오류:', error);
      updateStatus('오류가 발생했습니다: ' + error.message, true);
    }
  });

  // 웰컴플러스로 데이터 전송 이벤트
  sendBtn.addEventListener('click', async function () {
    try {
      // 웰컴플러스 견적 생성 페이지 URL
      const targetUrl = 'http://localhost:3000/manage/estimates/create';

      // 데이터가 있는지 확인
      if (!extractedProducts || extractedProducts.length === 0) {
        // 저장된 데이터가 있는지 확인
        const result = await chrome.storage.local.get(['extractedProducts']);
        if (result.extractedProducts) {
          extractedProducts = result.extractedProducts;
        } else {
          updateStatus('전송할 데이터가 없습니다. 먼저 데이터를 추출하세요.', true);
          return;
        }
      }

      updateStatus(`${extractedProducts.length}개의 데이터를 웰컴플러스로 전송합니다...`);

      // 새 탭에서 웰컴플러스 견적 생성 페이지 열기
      const newTab = await chrome.tabs.create({ url: targetUrl });

      // 데이터를 로컬 스토리지에 저장 (이미 저장되어 있지만 확실히 하기 위해)
      await chrome.storage.local.set({ extractedProducts });

      // 탭 상태를 추적하기 위한 변수
      let messageAttempts = 0;
      const maxAttempts = 5;

      // 탭 로드 완료 대기를 위한 리스너 등록
      chrome.tabs.onUpdated.addListener(function tabLoadListener(tabId, changeInfo, tab) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          // 리스너 제거
          chrome.tabs.onUpdated.removeListener(tabLoadListener);

          // 페이지 로드 완료 후 데이터 전송 시도를 위한 인터벌 설정
          const sendInterval = setInterval(async () => {
            try {
              messageAttempts++;
              console.log(`전송 시도 ${messageAttempts}/${maxAttempts}...`);

              // 메시지 전송
              await chrome.tabs.sendMessage(newTab.id, {
                action: 'fillEstimateForm',
                products: extractedProducts,
              });

              // 인터벌 정리
              clearInterval(sendInterval);
            } catch (error) {
              console.warn(`메시지 전송 시도 ${messageAttempts} 실패:`, error);

              // 최대 시도 횟수 초과시 인터벌 종료
              if (messageAttempts >= maxAttempts) {
                clearInterval(sendInterval);
                updateStatus('데이터 전송 실패. 페이지가 완전히 로드된 후 다시 시도하세요.', true);
              }
            }
          }, 1000); // 1초마다 시도
        }
      });
    } catch (error) {
      console.error('데이터 전송 중 오류:', error);
      updateStatus('오류가 발생했습니다: ' + error.message, true);
    }
  });

  // 로컬 스토리지에서 이전 데이터 로드
  chrome.storage.local.get(['extractedProducts'], function (result) {
    if (result.extractedProducts && result.extractedProducts.length > 0) {
      extractedProducts = result.extractedProducts;
      updateStatus(`저장된 ${extractedProducts.length}개의 상품 데이터가 있습니다.`);
      sendBtn.disabled = false;
    }
  });
});
