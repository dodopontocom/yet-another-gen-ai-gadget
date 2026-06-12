import { useState } from 'react';
import { History, Trophy, XCircle, Clock, Play, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlacedBet } from '../types';

export function MeuHistorico() {
  const { bets, simulateResult } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true;
    return bet.status === filter;
  });

  const statusStyles = {
    pending: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: Clock,
      label: 'Pendente',
    },
    won: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: Trophy,
      label: 'Ganhou',
    },
    lost: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: XCircle,
      label: 'Perdeu',
    },
  };

  const pendingBets = bets.filter(b => b.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Historico</h1>
          <p className="text-zinc-400 mt-1">Acompanhe todas as suas apostas</p>
        </div>

        {/* Simulate Results Button */}
        {pendingBets.length > 0 && (
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-2 border border-zinc-700">
            <Play className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-zinc-400">
              {pendingBets.length} aposta{pendingBets.length > 1 ? 's' : ''} pendente{pendingBets.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'won', label: 'Ganhou' },
          { id: 'lost', label: 'Perdeu' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${filter === item.id
                ? 'bg-amber-500 text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Simulate Section */}
      {pendingBets.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl p-5 border border-amber-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Simular Resultado</h3>
              <p className="text-sm text-zinc-400">Teste diferentes cenarios para suas apostas pendentes</p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingBets.map((bet) => (
              <div key={bet.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-800/50 rounded-lg p-4">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{bet.eventTitle}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {bet.chosenOption} - ${bet.amount.toLocaleString('pt-BR')} @ {bet.odds}x
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => simulateResult(bet.id, true)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Ganhou
                  </button>
                  <button
                    onClick={() => simulateResult(bet.id, false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Perdeu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bets List */}
      {filteredBets.length === 0 ? (
        <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-12 text-center">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">
            {filter === 'all'
              ? 'Voce ainda nao fez nenhuma aposta.'
              : `Nenhuma aposta ${filter === 'pending' ? 'pendente' : filter === 'won' ? 'ganha' : 'perdida'}.`
            }
          </p>
          {filter === 'all' && (
            <p className="text-sm text-zinc-500 mt-2">
              Va para "Apostas Ativas" para comecar!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBets.map((bet) => {
            const status = statusStyles[bet.status];
            const Icon = status.icon;
            return (
              <div
                key={bet.id}
                className={`bg-zinc-800/50 rounded-xl border ${status.border} overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{bet.eventTitle}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{bet.chosenOption}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                      <Icon className={`w-4 h-4 ${status.text}`} />
                      <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">Valor Apostado</p>
                      <p className="font-bold text-white">${bet.amount.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Multiplicador</p>
                      <p className="font-bold text-amber-400">{bet.odds.toFixed(2)}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Retorno Possivel</p>
                      <p className="font-bold text-zinc-300">
                        ${(bet.amount * bet.odds).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Resultado</p>
                      <p className={`font-bold ${bet.status === 'won' ? 'text-emerald-400' : bet.status === 'lost' ? 'text-red-400' : 'text-zinc-500'}`}>
                        {bet.status === 'won' && `+$${bet.payout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        {bet.status === 'lost' && `-$${bet.amount.toLocaleString('pt-BR')}`}
                        {bet.status === 'pending' && 'Aguardando'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-700/50 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      Apostado em {new Date(bet.placedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
