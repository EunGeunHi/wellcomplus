document.addEventListener('DOMContentLoaded', function () {
  const extractBtn = document.getElementById('extractBtn');
  const insertBtn = document.getElementById('insertBtn');
  const status = document.getElementById('status');

  // 현재 시간을 포맷팅하는 함수
  function getCurrentTimeString() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // 저장된 상태 확인
  chrome.storage.local.get(['extractedData', 'extractTime', 'productCount'], function (result) {
    if (result.extractedData) {
      insertBtn.disabled = false;

      // 시간과 상품 개수 정보가 있으면 함께 표시
      if (result.extractTime && result.productCount) {
        status.textContent = `${result.productCount}개의 데이터가 준비되었습니다. (${result.extractTime})`;
      } else {
        status.textContent = '견적 데이터가 준비되었습니다.';
      }
    }
  });

  // 다나와에서 견적 추출하기
  extractBtn.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentUrl = tabs[0].url;

      if (currentUrl.includes('shop.danawa.com/virtualestimate')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractProducts' }, function (response) {
          if (response && response.success) {
            const currentTime = getCurrentTimeString();

            // 추출 시간 저장
            chrome.storage.local.set({
              extractTime: currentTime,
              productCount: response.count,
            });

            status.textContent = `${response.count}개의 상품 정보를 추출했습니다. (${currentTime})`;
            insertBtn.disabled = false;
          } else {
            status.textContent = '상품 정보 추출에 실패했습니다.';
          }
        });
      } else {
        status.textContent = '다나와 견적 페이지에서만 사용할 수 있습니다.';
      }
    });
  });

  // 웰컴플러스에 견적 입력하기
  insertBtn.addEventListener('click', function () {
    status.textContent = '견적 입력 중...';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentUrl = tabs[0].url;

      // URL이 견적 생성 또는 견적 편집 페이지인지 확인
      if (
        currentUrl.includes('localhost:3000/manage/estimates/create') ||
        currentUrl.includes('localhost:3000/manage/estimates/edit/')
      ) {
        // 현재 탭이 웰컴플러스 견적 페이지인 경우
        try {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'insertProducts' }, function (response) {
            // 응답이 있으면 성공으로 간주 (실제 성공 여부는 페이지 내 알림으로 표시)
            if (response) {
              status.textContent = '웰컴플러스 페이지에 명령을 전송했습니다.';
              setTimeout(() => {
                status.textContent = '견적 정보를 입력했습니다.';
              }, 1000);
            } else {
              // 응답이 없으면 콘텐츠 스크립트가 로드되지 않았을 가능성이 있음
              handleContentScriptError(tabs[0].id);
            }
          });
        } catch (error) {
          console.error('메시지 전송 오류:', error);
          handleContentScriptError(tabs[0].id);
        }
      } else {
        // 웰컴플러스 페이지로 이동
        chrome.tabs.create(
          { url: 'http://localhost:3000/manage/estimates/create?autoInsert=true' },
          function (tab) {
            status.textContent = '웰컴플러스 페이지로 이동했습니다. 자동으로 입력을 시도합니다.';
          }
        );
      }
    });
  });

  // 콘텐츠 스크립트 오류 처리
  function handleContentScriptError(tabId) {
    status.textContent = '콘텐츠 스크립트 재주입 중...';

    // 콘텐츠 스크립트 강제 실행
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['content-wellcomplus.js'],
      },
      (injectionResults) => {
        if (chrome.runtime.lastError) {
          console.error('스크립트 주입 오류:', chrome.runtime.lastError);
          status.textContent = '견적 입력에 실패했습니다. 페이지를 새로고침 후 다시 시도하세요.';
          return;
        }

        // 스크립트 주입 성공 후 메시지 재전송
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { action: 'insertProducts' }, function (response) {
            if (response) {
              status.textContent = '견적 정보를 입력했습니다.';
            } else {
              status.textContent =
                '자동 입력에 실패했습니다. 페이지를 새로고침 후 다시 시도하세요.';
            }
          });
        }, 500);
      }
    );
  }
});
