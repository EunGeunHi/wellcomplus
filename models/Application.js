import mongoose from 'mongoose';

// 첨부파일 스키마 (Cloudinary 사용)
const FileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true, // Cloudinary secure_url
    },
    filename: {
      type: String,
      required: true, // Cloudinary에서의 파일명
    },
    originalName: {
      type: String,
      required: true, // 사용자가 업로드한 원본 파일명
    },
    mimeType: {
      type: String,
      required: true, // 파일의 MIME 타입
    },
    size: {
      type: Number,
      required: true, // 파일 크기 (바이트)
    },
    cloudinaryId: {
      type: String,
      required: true, // Cloudinary public_id (삭제시 필요)
    },
    uploadedAt: {
      type: Date,
      default: Date.now, // 업로드 시간
    },
  },
  { _id: true } // 파일별 고유 ID 생성
);

// 신청서 메인 스키마
const applicationSchema = new mongoose.Schema({
  // === 기본 정보 ===
  type: {
    type: String,
    required: true,
    enum: ['computer', 'printer', 'notebook', 'as', 'inquiry'],
    // 신청서 타입: 컴퓨터, 프린터, 노트북, A/S, 기타문의
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // 신청자의 사용자 ID (User 컬렉션 참조)
  },
  files: {
    type: [FileSchema],
    validate: {
      validator: function (files) {
        if (!files || files.length === 0) return true;

        // 파일 개수 제한 (최대 5개)
        return files.length <= 5;
      },
      message: '파일은 최대 5개까지만 업로드 가능합니다.',
    },
    // 첨부파일 배열 (최대 5개 제한, 크기 제한 없음)
  },

  // === 컴퓨터 견적 신청 정보 ===
  computer_information: {
    purpose: String, // 사용목적/용도 (예: 게임, 업무용, 영상편집)
    budget: String, // 예산 (예: 1,000,000원)
    cpu: String, // CPU 선호도 (인텔/AMD)
    gpu: String, // 그래픽카드 선호도 (NVIDIA/AMD)
    memory: String, // 메모리 용량 (4GB이하~64GB이상)
    storage: String, // 저장장치 용량 (500GB이하~3TB이상)
    cooling: String, // 쿨러 종류 (공냉/수냉/커스텀수냉)
    os: String, // 운영체제 (Windows 10/11)
    additionalRequests: String, // 추가 요청사항
    phoneNumber: String, // 연락처
    deliveryMethod: String, // 수령방법 (직접방문/택배)
    address: String, // 배송주소 (택배 선택시)
  },

  // === 프린터 견적 신청 정보 ===
  printer_information: {
    purpose: String, // 사용목적/용도 (예: 사무실 문서출력, 가정용 사진출력)
    budget: String, // 예산
    printerType: String, // 프린터 종류 (잉크젯/레이저)
    infiniteInk: String, // 무한잉크젯 (정품무한/개조무한)
    outputColor: String, // 출력색상 (흑백(모노)출력/컬러출력)
    additionalRequests: String, // 추가 요청사항
    phoneNumber: String, // 연락처
    deliveryMethod: String, // 수령방법 (직접방문/택배)
    address: String, // 배송주소 (택배 선택시)
  },

  // === 노트북 견적 신청 정보 ===
  notebook_information: {
    purpose: String, // 사용목적/용도 (예: 업무용, 게임, 학습용)
    budget: String, // 예산
    cpu: String, // CPU 선호도 (인텔/AMD)
    gpu: String, // 그래픽카드 선호도 (NVIDIA/AMD)
    weight: String, // 무게 선호도 (1kg이하~3kg이상)
    os: String, // 운영체제 (미포함, Windows, macOS)
    ram: String, // 메모리 용량 (2GB이하~64GB이상)
    storage: String, // 저장장치 용량 (64GB이하~3TB이상)
    additionalRequests: String, // 추가 요청사항
    phoneNumber: String, // 연락처
    deliveryMethod: String, // 수령방법 (직접방문/택배)
    address: String, // 배송주소 (택배 선택시)
  },

  // === A/S 신청 정보 ===
  as_information: {
    asCategory: String, // A/S 제품 분류 (컴퓨터/노트북/프린터)
    pcNumber: String, // PC 번호 (있는 경우)
    printerType: String, // 프린터 종류 (프린터 A/S시)
    printerNumber: String, // 프린터 번호 (프린터 A/S시)
    infiniteInk: String, // 무한잉크젯 여부 (프린터 A/S시)
    description: String, // 문제 상황 설명
    phoneNumber: String, // 연락처
    deliveryMethod: String, // 수령방법 (직접방문/택배)
    address: String, // 배송주소 (택배 선택시)
  },

  // === 기타 문의 정보 ===
  inquiry_information: {
    title: String, // 문의 제목
    content: String, // 문의 내용
    phoneNumber: String, // 연락처
  },

  // === 공통 관리 정보 ===
  status: {
    type: String,
    default: 'apply',
    enum: ['apply', 'in_progress', 'completed', 'cancelled'],
    // 처리 상태: 신청완료, 진행중, 완료, 취소
  },
  comment: {
    type: String,
    default:
      '접수 완료 후 담당자가 순차적으로 연락드립니다.\n궁금하신점이나 문의사항이 있으시면 010-8781-8871로 문의해주세요.',
    // 관리자 코멘트/안내 메시지
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // 신청서 생성 일시
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    // 신청서 최종 수정 일시
  },
});

// 성능 최적화를 위한 데이터베이스 인덱스 추가
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ type: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ createdAt: -1 });

// 상세페이지 조회 최적화를 위한 추가 인덱스
applicationSchema.index({ _id: 1, userId: 1 }); // 권한 확인과 함께 조회
applicationSchema.index({ type: 1, userId: 1 }); // 타입별 사용자 조회

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export default Application;
