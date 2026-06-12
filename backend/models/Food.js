import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export default mongoose.model('Food', foodSchema);
