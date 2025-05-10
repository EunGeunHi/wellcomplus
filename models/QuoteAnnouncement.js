import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: 'consumer',
    enum: ['consumer', 'business', 'delivery'], // 소비자용, 기업용, 납품서용 구분
  },
  templates: {
    type: [String],
    required: true,
    default: [
      '본 견적서는 수급상황에 따라, 금액과 부품이 대체/변동 될 수 있습니다.\n상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.\n계약금 입금 후 주문이 확정됩니다.',
      '',
      '',
      '',
      '',
    ],
    validate: [(array) => array.length <= 5, '최대 5개의 템플릿만 저장할 수 있습니다.'],
  },
  templateNames: {
    type: [String],
    required: true,
    default: ['기본 템플릿', '템플릿 2', '템플릿 3', '템플릿 4', '템플릿 5'],
    validate: [(array) => array.length <= 5, '최대 5개의 템플릿 이름만 저장할 수 있습니다.'],
  },
  activeTemplate: {
    type: Number,
    default: 0,
    min: 0,
    max: 4,
  },
  content: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.QuoteAnnouncement ||
  mongoose.model('QuoteAnnouncement', AnnouncementSchema);
