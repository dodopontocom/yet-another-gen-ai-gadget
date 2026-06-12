import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, required: true, unique: true },
  fominhaLevel: { type: Number, default: 0 },
  balance: { type: Number, default: 1000 },
  online: { type: Boolean, default: false },
  sessionId: { type: String },
});

export default mongoose.model('User', userSchema);
