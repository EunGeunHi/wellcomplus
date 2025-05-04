import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: 'consumer',
    enum: ['consumer', 'business', 'delivery'], // 소비자용, 기업용, 납품서용 구분
  },
  content: {
    type: String,
    required: true,
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
