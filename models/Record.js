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

const RecordSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['자료', '기록', '없음'],
      default: '없음',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    file: [FileSchema],
    content: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Record || mongoose.model('Record', RecordSchema);
