import { Crown, Medal, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function RankingFamilia() {
  const { familyMembers, currentUser } = useApp();

  const sortedFamily = [...familyMembers].sort((a, b) => b.balance - a.balance);
  const [first, second, third, ...rest] = sortedFamily;

  const podiumOrder = [
    { member: second, position: 2, height: 'h-28', medal: 'bg-zinc-300', text: 'text-zinc-900', label: '2o' },
    { member: first, position: 1, height: 'h-36', medal: 'bg-amber-400', text: 'text-zinc-900', label: '1o' },
    { member: third, position: 3, height: 'h-20', medal: 'bg-amber-700', text: 'text-white', label: '3o' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Ranking da Familia</h1>
        <p className="text-zinc-400 mt-1">Quem esta liderando o bolao?</p>
      </div>

      {/* Podium */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700/50 overflow-hidden">
        <div className="p-6 text-center border-b border-zinc-700/50">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-amber-400">Pódio</span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map(({ member, position, height, medal, text, label }) => (
              <div key={position} className="flex flex-col items-center">
                {/* Avatar and Crown */}
                <div className="relative mb-3">
                  {position === 1 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <Crown className="w-8 h-8 text-amber-400" />
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 ${
                    position === 1 ? 'border-amber-400 bg-amber-400/20' :
                    position === 2 ? 'border-zinc-300 bg-zinc-300/20' :
                    'border-amber-700 bg-amber-700/20'
                  }`}>
                    {member?.avatar}
                  </div>
                </div>

                {/* Name */}
                <p className={`font-semibold ${member?.id === 'user' ? 'text-amber-400' : 'text-white'} text-center max-w-[100px] truncate`}>
                  {member?.name}
                </p>

                {/* Balance */}
                <p className={`font-bold ${position === 1 ? 'text-amber-400' : 'text-zinc-300'} mt-1`}>
                  ${member?.balance.toLocaleString('pt-BR')}
                </p>

                {/* Podium Block */}
                <div className={`${height} w-20 rounded-t-lg ${medal} flex items-start justify-center pt-3 mt-3`}>
                  <span className={`font-black text-2xl ${text}`}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
        <div className="p-5 border-b border-zinc-700/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Classificacao Completa</h2>
          </div>
        </div>

        <div className="divide-y divide-zinc-700/50">
          {sortedFamily.map((member, index) => {
            const isUser = member.id === 'user';
            const previousBalance = 10000;
            const change = member.balance - previousBalance;
            const isUp = change > 0;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-4 p-4 transition-colors ${isUser ? 'bg-amber-500/10' : ''}`}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-amber-400 text-zinc-900' : ''}
                  ${index === 1 ? 'bg-zinc-300 text-zinc-900' : ''}
                  ${index === 2 ? 'bg-amber-700 text-white' : ''}
                  ${index > 2 ? 'bg-zinc-700 text-zinc-300' : ''}`}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  isUser ? 'bg-amber-500/20 ring-2 ring-amber-500' : 'bg-zinc-700'
                }`}>
                  {member.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isUser ? 'text-amber-400' : 'text-white'}`}>
                    {member.name}
                    {isUser && (
                      <span className="ml-2 text-xs bg-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full">
                        voce
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-zinc-500">
                      {index + 1}o lugar
                    </span>
                    {change !== 0 && (
                      <span className={`text-xs flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{change.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Balance */}
                <div className="text-right">
                  <p className={`text-lg font-bold ${isUser ? 'text-amber-400' : 'text-white'}`}>
                    ${member.balance.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Medal */}
                {index < 3 && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${index === 0 ? 'bg-amber-400 text-zinc-900' : ''}
                    ${index === 1 ? 'bg-zinc-300 text-zinc-900' : ''}
                    ${index === 2 ? 'bg-amber-700 text-white' : ''}`}
                  >
                    <Medal className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
