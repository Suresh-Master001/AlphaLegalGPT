import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  title: String,
  messages: [messageSchema]
}, {
  timestamps: true
});

// Index for faster queries by userId and sessionId
chatSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

// Static method to save or update a chat session
chatSchema.statics.save = async function(userId, chatData) {
  const { id: sessionId, title, messages } = chatData;
  
  const chat = await this.findOneAndUpdate(
    { userId, sessionId },
    { 
      $set: { 
        title, 
        messages,
        updatedAt: Date.now()
      } 
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
  
  return chat;
};

// Static method to find all chats for a user
chatSchema.statics.findByUser = async function(userId) {
  const chats = await this.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  
  return chats.map(chat => ({
    id: chat.sessionId,
    title: chat.title,
    messages: chat.messages,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt
  }));
};

// Static method to find a specific session
chatSchema.statics.findSession = async function(userId, sessionId) {
  const chat = await this.findOne({ userId, sessionId }).lean();
  
  if (!chat) return null;
  
  return {
    id: chat.sessionId,
    title: chat.title,
    messages: chat.messages,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt
  };
};

// Static method to delete a specific session
chatSchema.statics.delete = async function(userId, sessionId) {
  const result = await this.findOneAndDelete({ userId, sessionId });
  return !!result;
};

// Static method to clear all chats for a user
chatSchema.statics.clear = async function(userId) {
  const result = await this.deleteMany({ userId });
  return result.deletedCount;
};

export const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
