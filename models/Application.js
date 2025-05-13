import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
    fileName: String,
    fileSize: Number,
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['computer', 'printer', 'notebook', 'as', 'inquiry'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  files: {
    type: [FileSchema],
    validate: {
      validator: function (files) {
        if (!files || files.length === 0) return true;

        // 모든 파일 크기의 합계 계산 (바이트 단위)
        const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);

        // 2MB = 2 * 1024 * 1024 = 2097152 바이트
        return totalSize <= 2097152;
      },
      message: '파일 크기의 총합이 2MB를 초과할 수 없습니다.',
    },
  },
  computer_information: {
    purpose: String,
    budget: String,
    requirements: String,
    additional: String,
    etc: String,
    phoneNumber: String,
    address: String,
  },
  printer_information: {
    modelName: String,
    purpose: String,
    requirements: String,
    modification: String,
    additional: String,
    phoneNumber: String,
    address: String,
  },
  notebook_information: {
    modelName: String,
    manufacturer: String,
    brand: String,
    screenSize: String,
    cpuType: String,
    gpuType: String,
    ramSize: String,
    storageSize: String,
    os: String,
    weight: String,
    priceRange: String,
    purpose: String,
    additionalRequests: String,
    phoneNumber: String,
  },
  as_information: {
    itemType: String,
    description: String,
    phoneNumber: String,
  },
  inquiry_information: {
    title: String,
    content: String,
    phoneNumber: String,
  },
  status: {
    type: String,
    default: 'apply',
    //신청, 진행중, 완료, 취소
    enum: ['apply', 'in_progress', 'completed', 'cancelled'],
  },
  comment: {
    type: String,
    default:
      '접수 완료 후 담당자가 순차적으로 연락드립니다.\n궁금하신점이나 문의사항이 있으시면 010-8781-8871로 문의해주세요.',
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

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export default Application;
