import express from 'express';
import Bet from '../models/Bet.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, matchId, homeTeam, awayTeam, betType, exactHomeScore, exactAwayScore, simpleResult, stake } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (user.balance < stake) return res.status(400).json({ message: 'Saldo insuficiente' });
    
    user.balance -= stake;
    await user.save();
    
    const bet = new Bet({ userId, matchId, homeTeam, awayTeam, betType, exactHomeScore, exactAwayScore, simpleResult, stake });
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  const bets = await Bet.find({ userId: req.params.userId });
  res.json(bets);
});

export default router;
