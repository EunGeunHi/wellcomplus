import mongoose from 'mongoose';

// 모델이 이미 컴파일되었는지 확인
const EstimateSchema = new mongoose.Schema({
  // 견적 유형 분류
  estimateType: {
    type: String,
    enum: ['예전데이터', '컴퓨터견적', '프린터견적', '노트북견적', 'AS관련'],
    default: '없음', // 기본값 설정
  },

  // 고객 정보
  customerInfo: {
    name: String, // 이름
    phone: String, // 핸드폰번호
    pcNumber: String, // PC번호
    contractType: String, // 계약구분
    saleType: String, // 판매형태
    purchaseType: String, // 구입형태
    purchaseTypeName: String, // 지인 이름
    purpose: String, // 용도
    asCondition: String, // AS조건
    os: String, // 운영체계
    manager: String, // 견적담당
    content: String, // 내용
  },

  // 상품 데이터
  tableData: [
    {
      category: String, // 분류
      productName: String, // 상품명
      quantity: String, // 수량
      price: String, // 현금가
      productCode: String, // 상품코드
      distributor: String, // 총판
      reconfirm: String, // 제제조사
      remarks: String, // 비고
    },
  ],

  // 서비스 물품 데이터
  serviceData: [
    {
      id: String, // 고유 ID
      productName: String, // 상품명
      quantity: Number, // 수량
      remarks: String, // 비고
    },
  ],

  // 결제 정보
  paymentInfo: {
    laborCost: Number, // 공임비
    tuningCost: Number, // 튜닝금액
    setupCost: Number, // 세팅비
    warrantyFee: Number, // 보증관리비
    discount: Number, // 할인
    deposit: Number, // 계약금
    includeVat: Boolean, // VAT 포함 여부
    vatRate: Number, // VAT 비율
    roundingType: String, // 버림 타입
    paymentMethod: String, // 결제 방법
    shippingCost: Number, // 배송+설비 비용
    releaseDate: Date, // 출고일자
  },

  // 계산된 값들
  calculatedValues: {
    productTotal: Number, // 상품/부품 합 금액
    totalPurchase: Number, // 총 구입 금액
    vatAmount: Number, // VAT 금액
    finalPayment: Number, // 최종 결제 금액
  },

  // 참고사항
  notes: String,
  //계약자 여부 체크
  isContractor: Boolean,
  // 견적설명 추가
  estimateDescription: String,

  // 생성 및 수정 시간
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 검색 성능 향상을 위한 인덱스 추가
EstimateSchema.index({ createdAt: -1 }); // 생성일 기준 정렬 인덱스
EstimateSchema.index({ estimateType: 1 }); // 견적 타입 검색 인덱스
EstimateSchema.index({ isContractor: 1 }); // 계약자 상태 검색 인덱스
EstimateSchema.index({ 'customerInfo.name': 1 }); // 이름 검색 인덱스
EstimateSchema.index({ 'customerInfo.phone': 1 }); // 전화번호 검색 인덱스
EstimateSchema.index({ 'customerInfo.pcNumber': 1 }); // PC번호 검색 인덱스
EstimateSchema.index({ 'customerInfo.contractType': 1 }); // 계약구분 검색 인덱스

// 새로 추가된 검색 필드 인덱스
EstimateSchema.index({ notes: 1 }); // 참고사항 검색 인덱스
EstimateSchema.index({ estimateDescription: 1 }); // 견적설명 검색 인덱스
EstimateSchema.index({ 'tableData.productName': 1 }); // 상품명 검색 인덱스
EstimateSchema.index({ 'tableData.productCode': 1 }); // 상품코드 검색 인덱스
EstimateSchema.index({ 'tableData.distributor': 1 }); // 총판 검색 인덱스
EstimateSchema.index({ 'tableData.reconfirm': 1 }); // 재조사 검색 인덱스
EstimateSchema.index({ 'tableData.remarks': 1 }); // 비고 검색 인덱스

// 복합 인덱스 추가 (자주 함께 사용되는 필드들)
EstimateSchema.index({ estimateType: 1, isContractor: 1, createdAt: -1 }); // 견적 타입, 계약자 상태, 생성일 복합 인덱스

// mongoose.models 객체에 EstimateSchema가 있으면 그것을 사용하고, 없으면 새로 만듭니다.
export default mongoose.models.Estimate || mongoose.model('Estimate', EstimateSchema);
