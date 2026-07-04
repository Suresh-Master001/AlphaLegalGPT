import mongoose from 'mongoose';

const globalHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster text search
globalHistorySchema.index({ query: 'text', response: 'text' });

// Static method to save a history item
globalHistorySchema.statics.save = async function(query, response) {
  const historyItem = await this.create({
    query,
    response
  });
  return historyItem;
};

// Static method to get all history items
globalHistorySchema.statics.getAll = async function() {
  const history = await this.find()
    .sort({ createdAt: -1 })
    .lean();
  
  return history.map(item => ({
    question: item.query,
    answer: item.response,
    createdAt: item.createdAt
  }));
};

export const GlobalHistory = mongoose.model('GlobalHistory', globalHistorySchema);

export default GlobalHistory;
