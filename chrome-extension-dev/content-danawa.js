// 상품 데이터 추출 함수
function extractProductData() {
  const products = [];

  // pd_list_area 내의 상품 정보 추출
  const pdListArea = document.querySelector('.pd_list_area');
  if (!pdListArea) {
    console.error('pd_list_area를 찾을 수 없습니다.');
    return products;
  }

  // 각 카테고리 그룹 처리
  const pdLists = pdListArea.querySelectorAll('.pd_list');
  pdLists.forEach((pdList) => {
    // 각 카테고리 처리
    const pdItems = pdList.querySelectorAll('.pd_item');
    pdItems.forEach((pdItem) => {
      // 카테고리명 (CPU, 메인보드 등)
      const categoryTitle = pdItem
        .querySelector('.pd_item_title')
        ?.textContent.trim()
        .replace(/NEW/gi, '')
        .trim() // "NEW" 태그 제거 (대소문자 구분 없이)
        .replace(/\s*선택됨$/, '')
        .trim(); // "선택됨" 텍스트 제거

      // 각 상품 처리
      const rows = pdItem.querySelectorAll('.pd_item_list li.row');
      rows.forEach((row) => {
        // 상품명
        let productName = row.querySelector('.subject a')?.textContent.trim() || '';
        // '선택됨' 등 불필요한 텍스트 제거
        productName = productName.replace(/선택됨/g, '').trim();

        // 가격 (숫자만 추출)
        const priceText = row.querySelector('.price')?.textContent.trim() || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

        // 수량
        const quantity = parseInt(row.querySelector('.input_qnt')?.value || '1', 10);

        if (productName) {
          products.push({
            productName,
            price,
            quantity,
            category: categoryTitle,
          });
        }
      });
    });
  });

  return products;
}

// 현재 시간을 포맷팅하는 함수
function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// 추출된 데이터를 웰컴플러스 형식으로 변환
function convertToWellcomplusFormat(products) {
  if (!products || products.length === 0) {
    return '';
  }

  // 웰컴플러스에서 요구하는 형식으로 변환: category productName quantity - - - price
  return products
    .map((product) => {
      return `${product.category}\t${product.productName}\t${product.quantity}\t-\t-\t-\t${product.price}`;
    })
    .join('\n');
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'extractProducts') {
    try {
      // 상품 데이터 추출
      const products = extractProductData();

      if (products.length === 0) {
        sendResponse({ success: false, message: '추출할 상품이 없습니다.' });
        return true;
      }

      // 웰컴플러스 형식으로 변환
      const formattedData = convertToWellcomplusFormat(products);

      // 현재 시간 가져오기
      const extractTime = getCurrentTimeString();

      // 데이터 저장
      chrome.storage.local.set(
        {
          extractedData: formattedData,
          productCount: products.length,
          extractTime: extractTime,
        },
        function () {
          // 상태 표시
          console.log(`다나와 견적 데이터가 저장되었습니다. (${extractTime})`);

          // 알림 표시
          sendResponse({
            success: true,
            count: products.length,
            time: extractTime,
            message: `${products.length}개의 상품 정보가 추출되었습니다. (${extractTime})`,
          });
        }
      );
    } catch (error) {
      console.error('상품 정보 추출 중 오류 발생:', error);
      sendResponse({
        success: false,
        message: '상품 정보 추출 중 오류가 발생했습니다: ' + error.message,
      });
    }

    return true; // 비동기 응답 처리
  }
});
