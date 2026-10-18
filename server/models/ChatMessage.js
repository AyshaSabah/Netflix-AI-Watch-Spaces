import mongoose from 'mongoose';

// ChatMessage Schema for Room Group Chat
const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  message: {
    type: String,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
