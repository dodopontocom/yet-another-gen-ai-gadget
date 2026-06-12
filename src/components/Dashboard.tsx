import { Trophy, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoundTable } from './RoundTable';

export function Dashboard() {
  const { currentUser, bets, onlineUsers } = useApp();

  if (!currentUser) return null;

  const activeBets = bets.filter(b => b.status === 'pending').length;
  const wonBets = bets.filter(b => b.status === 'won');
  const lostBets = bets.filter(b => b.status === 'lost');

  const sortedUsers = [...onlineUsers, currentUser].sort((a, b) => b.fominhaLevel - a.fominhaLevel);
  const userRank = sortedUsers.findIndex(u => u._id === currentUser._id) + 1;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-zinc-900 shadow-xl shadow-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Seu Saldo Atual</p>
            <p className="text-5xl font-black mt-2 flex items-center gap-2">
              <DollarSign className="w-10 h-10" />
              {currentUser.balance.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="w-20 h-20 bg-zinc-900/20 rounded-full flex items-center justify-center text-5xl">
            {currentUser.emoji}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-amber-600/30 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Fominha Level</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {currentUser.fominhaLevel} <Star className="w-5 h-5 fill-current" />
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Sua posição</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              #{userRank} {userRank <= 3 && <Trophy className="w-5 h-5" />}
            </p>
          </div>
        </div>
      </div>

      {/* Round Table */}
      <RoundTable />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Apostas Ativas</p>
              <p className="text-2xl font-bold text-white">{activeBets}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Apostas Ganhas</p>
              <p className="text-2xl font-bold text-emerald-400">{wonBets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Apostas Perdidas</p>
              <p className="text-2xl font-bold text-red-400">{lostBets.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
