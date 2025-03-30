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
