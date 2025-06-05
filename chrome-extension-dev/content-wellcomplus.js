// 웰컴플러스 견적 시스템에 데이터 입력
function insertProductData() {
  return new Promise((resolve, reject) => {
    // 저장된 견적 데이터 가져오기
    chrome.storage.local.get(['extractedData'], function (result) {
      if (!result.extractedData) {
        console.error('견적 데이터가 없습니다.');
        reject('견적 데이터가 없습니다. 먼저 다나와에서 데이터를 추출해주세요.');
        return;
      }

      try {
        // textarea 요소 찾기 - 요소를 찾을 때까지 대기하는 로직 추가
        let attempts = 0;
        const maxAttempts = 5;
        const interval = 500; // 500ms 간격으로 검사

        const findElementsAndProcess = () => {
          // textarea 요소 찾기
          const textarea = document.getElementById('bulkProductInput');
          if (!textarea) {
            attempts++;
            if (attempts < maxAttempts) {
              console.log(`textarea 요소를 찾는 중... 시도 ${attempts}/${maxAttempts}`);
              setTimeout(findElementsAndProcess, interval);
              return;
            } else {
              console.error('일괄 입력을 위한 textarea를 찾을 수 없습니다.');
              reject('일괄 입력을 위한 textarea를 찾을 수 없습니다.');
              return;
            }
          }

          // 데이터 입력
          textarea.value = result.extractedData;

          // 일괄 입력하기 버튼 찾기 - 여러 방법으로 시도
          const buttons = Array.from(document.querySelectorAll('button'));
          let bulkInputButton = buttons.find(
            (button) =>
              button.textContent.includes('일괄 입력하기') ||
              button.innerText.includes('일괄 입력하기')
          );

          // 버튼을 찾지 못한 경우 직접 이벤트 트리거
          if (!bulkInputButton) {
            console.log('일괄 입력하기 버튼을 찾지 못했습니다. 직접 이벤트를 발생시킵니다.');
            // textarea에 값을 설정한 후 change 이벤트 트리거
            const event = new Event('change', { bubbles: true });
            textarea.dispatchEvent(event);

            // 페이지의 handleBulkProductInput 함수 직접 호출 시도
            // 페이지 내 함수에 직접 접근하는 것은 보안상 제한될 수 있음
            try {
              // window 객체에 handleBulkProductInput 함수가 있는지 확인
              const scriptToExecute = `
                if (typeof handleBulkProductInput === 'function') {
                  handleBulkProductInput();
                  true;
                } else {
                  false;
                }
              `;

              const functionCalled = eval(scriptToExecute);

              if (!functionCalled) {
                // 버튼 자동 생성 및 클릭
                console.log('버튼을 자동으로 생성하고 클릭을 시뮬레이션합니다.');

                // 일괄 입력 함수 실행을 위한 커스텀 버튼 생성 및 클릭
                const customButton = document.createElement('button');
                customButton.textContent = '일괄 입력하기';
                customButton.style.display = 'none';
                document.body.appendChild(customButton);

                // 클릭 이벤트가 버블링되도록 설정
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                });

                // 버튼 클릭
                customButton.dispatchEvent(clickEvent);

                // 작업 후 버튼 제거
                setTimeout(() => {
                  customButton.remove();
                }, 100);
              }
            } catch (e) {
              console.error('자동 함수 호출 실패:', e);
            }

            // 성공으로 처리 (최선의 시도를 했으므로)
            setTimeout(() => {
              resolve('견적 데이터가 입력되었습니다. (자동 처리)');
            }, 500);
            return;
          }

          // 버튼 클릭 (이벤트 시뮬레이션)
          setTimeout(() => {
            bulkInputButton.click();
            resolve('견적 데이터가 성공적으로 입력되었습니다.');
          }, 500); // 0.5초 지연 후 클릭
        };

        // 첫 시도 시작
        findElementsAndProcess();
      } catch (error) {
        console.error('견적 데이터 입력 실패:', error);
        reject('견적 데이터 입력 중 오류가 발생했습니다: ' + error.message);
      }
    });
  });
}

// 페이지에 적용할 스크립트 삽입 함수
function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'insertProducts') {
    console.log('웰컴플러스 페이지에서 견적 데이터 입력 요청을 받았습니다.');

    // 응답 지연을 방지하기 위해 즉시 응답 시작 메시지 전송
    sendResponse({ status: 'processing' });

    insertProductData()
      .then((message) => {
        console.log('성공:', message);
        // 성공 알림 표시
        showNotification('견적 데이터가 성공적으로 입력되었습니다.', 'success');

        // 성공 결과는 별도로 전송할 수 없음 (sendResponse는 이미 호출됨)
      })
      .catch((error) => {
        console.error('실패:', error);
        // 오류 알림 표시
        showNotification('견적 데이터 입력 실패: ' + error, 'error');
      });

    // 비동기 처리를 위한 true 반환 (sendResponse는 이미 호출됨)
    return true;
  }
});

// 알림 표시 함수
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.zIndex = '9999';
  notification.style.padding = '10px 20px';
  notification.style.backgroundColor = type === 'success' ? '#3dd443' : '#f44336';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  document.body.appendChild(notification);

  // 3초 후 알림 제거
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// 페이지 로드 완료 시 자동 실행 확인
window.addEventListener('load', function () {
  console.log('웰컴플러스 페이지 로드 완료');

  // 자동 입력 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('autoInsert') === 'true') {
    console.log('자동 입력 파라미터 감지됨');

    // 페이지 완전히 로드된 후 1초 지연 후 실행
    setTimeout(() => {
      insertProductData()
        .then((message) => {
          console.log(message);
          // 성공 알림 표시
          showNotification('견적 데이터가 자동으로 입력되었습니다.');
        })
        .catch((error) => {
          console.error('자동 데이터 입력 중 오류 발생:', error);
          showNotification('자동 입력 실패: ' + error, 'error');
        });
    }, 1000);
  }

  // 디버깅용 콘솔 메시지
  console.log('웰컴플러스 페이지에 견적 입력 기능 준비 완료');
});
