// 다나와 견적 추출 백그라운드 스크립트
console.log('다나와 견적 추출 확장 프로그램 백그라운드 스크립트가 시작되었습니다.');

// 확장 프로그램 설치 이벤트
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    console.log('확장 프로그램이 설치되었습니다.');
    // 설치 후 환영 메시지 또는 가이드 페이지를 열 수 있음
  } else if (details.reason === 'update') {
    console.log('확장 프로그램이 업데이트되었습니다.');
  }
});

// 탭 변경 시 아이콘 상태 업데이트
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('shop.danawa.com/virtualestimate')) {
      // 다나와 견적 페이지에서는 아이콘 활성화
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          16: 'images/icon16.png',
          48: 'images/icon48.png',
          128: 'images/icon128.png',
        },
      });
    }
  }
});

// 메시지 핸들러
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'notify') {
    // 알림 표시
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: '다나와 견적 추출',
      message: request.message || '작업이 완료되었습니다.',
    });

    return true;
  }
});
