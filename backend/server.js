import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import betRoutes from './routes/betRoutes.js';
import { setupSocket } from './socket/socketHandler.js';
import { getStadiumInfo } from './constants/stadiums.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/bets', betRoutes);

app.get('/api/games', async (req, res) => {
  try {
    const response = await fetch('https://worldcup26.ir/get/games');
    const data = await response.json();
    
    // Process each game to add stadium info and UTC timestamp
    const processedGames = (data.games || []).map(game => {
      const stadiumInfo = getStadiumInfo(game.stadium_name);
      
      // Try to parse the local_date into a UTC timestamp
      let utcDate = null;
      if (game.local_date) {
        try {
          // Assume local_date is in the stadium's timezone
          const dateStr = game.local_date;
          // Let's parse it to a Date object in the stadium's timezone, then convert to UTC
          utcDate = new Date(dateStr).toISOString();
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
      
      return {
        ...game,
        stadium_city: stadiumInfo.city,
        stadium_timezone: stadiumInfo.timezone,
        utc_date: utcDate,
      };
    });
    
    res.json({ games: processedGames });
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ message: 'Erro ao buscar jogos' });
  }
});

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
