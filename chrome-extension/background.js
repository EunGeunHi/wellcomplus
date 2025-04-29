// 확장 프로그램 설치/업데이트 시 실행
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    // 처음 설치 시
    console.log('다나와 견적 추출기가 설치되었습니다.');
  } else if (details.reason === 'update') {
    // 업데이트 시
    console.log('다나와 견적 추출기가 업데이트되었습니다.');
  }
});

// 크롬 확장 아이콘 클릭 시 팝업이 뜨므로 별도 처리 불필요

// 웹 페이지간 통신 중개 (필요 시)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'navigateToWellcomplus') {
    // 웰컴플러스 페이지로 이동 요청 처리
    chrome.tabs.create(
      {
        url: 'http://localhost:3000/manage/estimates/create?autoInsert=true',
      },
      function (tab) {
        sendResponse({ success: true });
      }
    );
    return true; // 비동기 응답 처리
  }
});
