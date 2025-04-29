// 다나와 PC 견적 데이터 추출 스크립트
console.log('다나와 견적 추출 확장 프로그램이 실행되었습니다.');

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    try {
      const products = extractProductData();
      console.log('추출된 상품 데이터:', products);
      sendResponse({ success: true, data: products, count: products.length });
    } catch (error) {
      console.error('데이터 추출 중 오류 발생:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 비동기 응답을 위해 true 반환
  }
});

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
        const productName = row.querySelector('.subject a')?.textContent.trim() || '';

        // 상품 ID
        const productId = row.id?.replace('wishList_', '') || `temp_${Date.now()}_${Math.random()}`;

        // 가격 (숫자만 추출)
        const priceText = row.querySelector('.price')?.textContent.trim() || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

        // 수량
        const quantity = parseInt(row.querySelector('.input_qnt')?.value || '1', 10);

        if (productName) {
          products.push({
            id: productId,
            category: categoryTitle,
            productName: productName,
            quantity: quantity,
            price: price,
            totalPrice: price * quantity,
          });
        }
      });
    });
  });

  return products;
}
