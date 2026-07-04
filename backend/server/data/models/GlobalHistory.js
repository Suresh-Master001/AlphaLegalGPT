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

export const GlobalHistory = mongoose.model('GlobalHistory', globalHistorySchema);

export default GlobalHistory;