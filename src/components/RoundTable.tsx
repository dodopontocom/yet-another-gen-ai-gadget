import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { io, Socket } from 'socket.io-client';
import { Users, Trophy } from 'lucide-react';

export function RoundTable() {
  const { currentUser, onlineUsers, foods, setOnlineUsers, setFoods, addToast } = useApp();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.emit('user-online', currentUser._id);

    socket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('foods-update', (foodsData) => {
      setFoods(foodsData);
    });

    fetch('http://localhost:3001/api/foods')
      .then(res => res.json())
      .then(data => setFoods(data));

    return () => {
      socket.disconnect();
    };
  }, [currentUser, setOnlineUsers, setFoods]);

  const handleEatFood = (foodId: string) => {
    if (!currentUser || !socketRef.current) return;
    socketRef.current.emit('eat-food', { foodId, userId: currentUser._id });
    addToast('Você comeu um alimento! +1 Fominha Level!', 'success');
  };

  const usersInCircle = onlineUsers.length > 0 ? onlineUsers : (currentUser ? [currentUser] : []);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Mesa Redonda</h2>
        <div className="flex items-center gap-2 bg-blue-500/30 px-4 py-2 rounded-full border border-blue-400/30">
          <Users className="w-5 h-5 text-blue-300" />
          <span className="text-white font-semibold">{onlineUsers.length} Online</span>
        </div>
      </div>

      <div className="relative aspect-square max-w-2xl mx-auto">
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-8 border-amber-600 shadow-2xl">
          {foods.map((food) => (
            <button
              key={food._id}
              onClick={() => handleEatFood(food._id)}
              className="absolute text-4xl hover:scale-150 transition-transform cursor-pointer animate-bounce"
              style={{ left: `${food.x}%`, top: `${food.y}%` }}
            >
              {food.emoji}
            </button>
          ))}
        </div>

        {usersInCircle.map((user, index) => {
            if (!user) return null;
            const angle = (index / usersInCircle.length) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + 45 * Math.cos(angle);
            const y = 50 + 45 * Math.sin(angle);
            return (
              <div
                key={user._id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl border-4 ${
                  user._id === currentUser?._id ? 'bg-green-500 border-green-400' : 'bg-blue-500 border-blue-400'
                } shadow-lg`}>
                  {user.emoji}
                </div>
                <span className="text-white text-xs mt-1 font-semibold">{user.name}</span>
                <div className="flex items-center gap-2 bg-yellow-500/30 px-2 py-1 rounded-full text-yellow-300 text-xs mt-1">
                  <Trophy className="w-3 h-3" />
                  {user.fominhaLevel}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
