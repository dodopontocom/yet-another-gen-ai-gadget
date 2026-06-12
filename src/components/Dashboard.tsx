import { Trophy, TrendingUp, History, ArrowUpRight, ArrowDownRight, Crown, Medal } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const { currentUser, bets, familyMembers } = useApp();

  const totalBets = bets.length;
  const activeBets = bets.filter(b => b.status === 'pending').length;
  const wonBets = bets.filter(b => b.status === 'won');
  const lostBets = bets.filter(b => b.status === 'lost');
  const totalWon = wonBets.reduce((sum, b) => sum + b.payout, 0);
  const totalLost = lostBets.reduce((sum, b) => sum + b.amount, 0);

  const sortedFamily = [...familyMembers].sort((a, b) => b.balance - a.balance);
  const userRank = sortedFamily.findIndex(m => m.id === 'user') + 1;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bem-vindo ao <span className="text-amber-400">Bolao da Familia</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Aposte, divirta-se e mostre quem manda na familia!
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-zinc-900 shadow-xl shadow-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Seu Saldo Atual</p>
            <p className="text-5xl font-black mt-2">
              ${currentUser.balance.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="w-16 h-16 bg-zinc-900/20 rounded-full flex items-center justify-center text-4xl">
            {currentUser.avatar}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-amber-600/30 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Sua posicao no ranking</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              #{userRank}
              {userRank <= 3 && <Trophy className="w-5 h-5" />}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Total de apostas</p>
            <p className="text-2xl font-bold">{totalBets}</p>
          </div>
        </div>
      </div>

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
              <p className="text-sm text-zinc-400">Total Ganho</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${totalWon.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Perdido</p>
              <p className="text-2xl font-bold text-red-400">
                ${totalLost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Widget */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <div className="p-5 border-b border-zinc-700/50">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Ranking da Familia</h2>
          </div>
        </div>
        <div className="divide-y divide-zinc-700/50">
          {sortedFamily.slice(0, 5).map((member, index) => {
            const isUser = member.id === 'user';
            return (
              <div
                key={member.id}
                className={`flex items-center gap-4 p-4 transition-colors ${isUser ? 'bg-amber-500/10' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-amber-400 text-zinc-900' : ''}
                  ${index === 1 ? 'bg-zinc-300 text-zinc-900' : ''}
                  ${index === 2 ? 'bg-amber-700 text-white' : ''}
                  ${index > 2 ? 'bg-zinc-700 text-zinc-300' : ''}`}
                >
                  {index < 3 ? index + 1 : index + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xl">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isUser ? 'text-amber-400' : 'text-white'}`}>
                    {member.name}
                    {isUser && <span className="text-xs ml-2 text-amber-400/70">(voce)</span>}
                  </p>
                </div>
                <p className={`font-bold ${isUser ? 'text-amber-400' : 'text-white'}`}>
                  ${member.balance.toLocaleString('pt-BR')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
