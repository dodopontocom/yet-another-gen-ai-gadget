import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Crown, Users } from 'lucide-react';

export function RankingFamilia() {
  const { onlineUsers, setOnlineUsers, currentUser, addToast } = useApp();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetch(`${API_URL}/api/users/online`)
      .then(res => res.json())
      .then(data => setOnlineUsers(data))
      .catch(() => addToast('Erro ao carregar ranking', 'error'));
  }, [setOnlineUsers, addToast]);

  const allUsers = currentUser ? [...onlineUsers, currentUser] : onlineUsers;
  const uniqueUsers = Array.from(new Map(allUsers.map(u => [u._id, u])).values());
  const sortedUsers = [...uniqueUsers].sort((a, b) => b.fominhaLevel - a.fominhaLevel);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Ranking</h1>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-300" />
          <span className="text-white font-semibold">{uniqueUsers.length} jogadores</span>
        </div>

        <div className="grid gap-4">
          {sortedUsers.map((user, index) => {
            const isCurrentUser = user._id === currentUser?._id;
            return (
              <div
                key={user._id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isCurrentUser ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                  'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {index === 0 ? <Crown className="w-6 h-6" /> : index + 1}
                </div>

                <div className="w-14 h-14 rounded-full flex items-center justify-center text-4xl bg-zinc-800">
                  {user.emoji}
                </div>

                <div className="flex-1">
                  <p className={`font-semibold ${isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
                    {user.name}
                    {isCurrentUser && <span className="text-xs ml-2 text-amber-400/70">(você)</span>}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    {user.fominhaLevel}
                  </p>
                  <p className="text-zinc-400 text-sm">Saldo: ${user.balance}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
