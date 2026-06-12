import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  betType: { type: String, enum: ['exact', 'simple'], required: true },
  exactHomeScore: { type: Number },
  exactAwayScore: { type: Number },
  simpleResult: { type: String, enum: ['home', 'draw', 'away'] },
  stake: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Bet', betSchema);
