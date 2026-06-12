import express from 'express';
import Food from '../models/Food.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});

export default router;
