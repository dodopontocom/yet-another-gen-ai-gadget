import express from 'express';
import User from '../models/User.js';
import { AVATARS } from '../constants/avatars.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { pin } = req.body;
  if (pin !== process.env.PIN) {
    return res.status(401).json({ message: 'PIN incorreto' });
  }
  res.json({ success: true });
});

router.get('/avatars', async (req, res) => {
  const takenAvatars = await User.find({}, 'emoji');
  const takenEmojis = takenAvatars.map(u => u.emoji);
  const availableAvatars = AVATARS.map(avatar => ({
    ...avatar,
    taken: takenEmojis.includes(avatar.emoji),
  }));
  res.json(availableAvatars);
});

router.post('/register', async (req, res) => {
  const { name, emoji, sessionId } = req.body;
  try {
    const existingUser = await User.findOne({ emoji });
    if (existingUser) {
      return res.status(400).json({ message: 'Avatar já selecionado' });
    }
    const user = new User({ name, emoji, online: true, sessionId });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/online', async (req, res) => {
  const onlineUsers = await User.find({ online: true });
  res.json(onlineUsers);
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
});

export default router;
