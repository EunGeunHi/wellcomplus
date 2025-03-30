import mongoose from 'mongoose';

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
  purpose: {
    type: String,
    default: '',
  },
  budget: {
    type: String,
    default: '',
  },
  requirements: {
    type: String,
    default: '',
  },
  additional: {
    type: String,
    default: '',
  },
  etc: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'registration',
    enum: ['registration', 'in_progress', 'completed', 'cancelled'],
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
