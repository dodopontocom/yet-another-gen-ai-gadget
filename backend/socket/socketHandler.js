import User from '../models/User.js';
import Food from '../models/Food.js';
import { FOOD_EMOJIS } from '../constants/foods.js';

let io;

export const setupSocket = (socketIo) => {
  io = socketIo;
  
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('user-online', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { online: true, sessionId: socket.id });
        const onlineUsers = await User.find({ online: true });
        io.emit('online-users', onlineUsers);
      } catch (err) {
        console.error(err);
      }
    });
    
    socket.on('eat-food', async ({ foodId, userId }) => {
      try {
        await Food.findByIdAndDelete(foodId);
        const user = await User.findByIdAndUpdate(
          userId,
          { $inc: { fominhaLevel: 1 } },
          { new: true }
        );
        const foods = await Food.find();
        const onlineUsers = await User.find({ online: true });
        io.emit('foods-update', foods);
        io.emit('online-users', onlineUsers);
      } catch (err) {
        console.error(err);
      }
    });
    
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      try {
        await User.findOneAndUpdate({ sessionId: socket.id }, { online: false });
        const onlineUsers = await User.find({ online: true });
        io.emit('online-users', onlineUsers);
      } catch (err) {
        console.error(err);
      }
    });
  });
  
  spawnFoods();
};

const spawnFoods = () => {
  setInterval(async () => {
    const randomFood = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    const food = new Food({ emoji: randomFood, x, y });
    await food.save();
    const foods = await Food.find();
    io.emit('foods-update', foods);
  }, 5000);
};
