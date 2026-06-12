import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react';

export function MeuHistorico() {
  const { currentUser, bets, setBets, addToast } = useApp();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/api/bets/user/${currentUser._id}`)
        .then(res => res.json())
        .then(data => setBets(data))
        .catch(() => addToast('Erro ao carregar apostas', 'error'));
    }
  }, [currentUser, setBets, addToast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'won':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'won':
        return 'Ganhou';
      case 'lost':
        return 'Perdeu';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Meu Histórico</h1>

      <div className="grid gap-4">
        {bets.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Você ainda não fez nenhuma aposta</p>
          </div>
        ) : (
          bets.map((bet) => (
            <div key={bet._id} className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-bold text-white">{bet.homeTeam} vs {bet.awayTeam}</p>
                  <p className="text-zinc-400 text-sm">{new Date(bet.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(bet.status)}
                  <span className={`font-semibold ${
                    bet.status === 'pending' ? 'text-yellow-400' :
                    bet.status === 'won' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {getStatusText(bet.status)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-zinc-700/50 rounded-xl p-4">
                <div>
                  <p className="text-zinc-400 text-sm">Tipo de Aposta</p>
                  <p className="text-white font-semibold">
                    {bet.betType === 'exact' ? 'Placar Exato' : 'Resultado'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Previsão</p>
                  <p className="text-white font-semibold">
                    {bet.betType === 'exact'
                      ? `${bet.exactHomeScore} x ${bet.exactAwayScore}`
                      : bet.simpleResult === 'home'
                      ? bet.homeTeam
                      : bet.simpleResult === 'draw'
                      ? 'Empate'
                      : bet.awayTeam
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm">Valor</p>
                  <p className="text-2xl font-bold text-white">${bet.stake}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
