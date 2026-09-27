import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    title: { type: String, default: 'New Chat' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Chat', chatSchema);