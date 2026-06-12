import { useState } from 'react';
import { CircleDot, Tv, Users, Calendar, X, DollarSign, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BettingEvent } from '../types';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'football': CircleDot,
  'reality-show': Tv,
  'family-games': Users,
  'other': TrendingUp,
};

const categoryLabels: Record<string, string> = {
  'football': 'Futebol',
  'reality-show': 'Reality Show',
  'family-games': 'Jogos da Familia',
  'other': 'Outros',
};

export function ApostasAtivas() {
  const { events, currentUser, placeBet } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<BettingEvent | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');

  const handleOpenModal = (event: BettingEvent) => {
    setSelectedEvent(event);
    setSelectedOption(null);
    setBetAmount('');
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedOption(null);
    setBetAmount('');
  };

  const handlePlaceBet = () => {
    if (!selectedEvent || !selectedOption) return;
    const amount = parseFloat(betAmount.replace(/\./g, '').replace(',', '.'));
    if (placeBet(selectedEvent.id, selectedOption, amount)) {
      handleCloseModal();
    }
  };

  const formatAmount = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const num = parseInt(numbers, 10);
    return num.toLocaleString('pt-BR');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(formatAmount(e.target.value));
  };

  const calculatedPayout = () => {
    if (!selectedOption || !selectedEvent) return 0;
    const option = selectedEvent.options.find(o => o.id === selectedOption);
    if (!option) return 0;
    const amount = parseFloat(betAmount.replace(/\./g, '').replace(',', '.')) || 0;
    return amount * option.odds;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Apostas Disponiveis</h1>
          <p className="text-zinc-400 mt-1">Escolha um evento e faca sua aposta</p>
        </div>
        <div className="bg-zinc-800 rounded-xl px-4 py-2 border border-zinc-700">
          <p className="text-xs text-zinc-400">Seu saldo</p>
          <p className="text-lg font-bold text-amber-400">
            ${currentUser.balance.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => {
          const Icon = categoryIcons[event.category];
          return (
            <div
              key={event.id}
              className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden hover:border-amber-500/50 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 uppercase">
                      {categoryLabels[event.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.deadline).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">{event.title}</h3>

                <div className="space-y-2">
                  {event.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        handleOpenModal(event);
                        setSelectedOption(option.id);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors group"
                    >
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
                        {option.label}
                      </span>
                      <span className="px-3 py-1 rounded-md bg-amber-500/20 text-amber-400 font-bold text-sm">
                        {option.odds.toFixed(2)}x
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Betting Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-700">
              <div>
                <p className="text-xs text-amber-400 font-medium uppercase">Nova Aposta</p>
                <h2 className="text-lg font-bold text-white mt-1">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Options */}
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">
                  Escolha sua opcao
                </label>
                <div className="space-y-2">
                  {selectedEvent.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
                        ${selectedOption === option.id
                          ? 'bg-amber-500 text-zinc-900'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className={`font-bold ${selectedOption === option.id ? 'text-zinc-900' : 'text-amber-400'}`}>
                        {option.odds.toFixed(2)}x
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">
                  Valor da aposta
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                    $
                  </span>
                  <input
                    type="text"
                    value={betAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-3 font-bold text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Saldo disponivel: ${currentUser.balance.toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Potential Payout */}
              {selectedOption && betAmount && (
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Possivel retorno:</span>
                    <span className="text-xl font-bold text-emerald-400">
                      ${calculatedPayout().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount.toLocaleString('pt-BR'))}
                    className="flex-1 py-2 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    ${amount.toLocaleString('pt-BR')}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-700">
              <button
                onClick={handlePlaceBet}
                disabled={!selectedOption || !betAmount}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all
                  ${selectedOption && betAmount
                    ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }`}
              >
                <DollarSign className="w-5 h-5" />
                Confirmar Aposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
