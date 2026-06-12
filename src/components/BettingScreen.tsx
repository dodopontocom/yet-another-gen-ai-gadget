import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Game } from '../types';
import { Plus, Minus, Trophy, MapPin } from 'lucide-react';

function formatBrazilianDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}

function formatBrazilianTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

function formatLocalTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
}

function getBrazilianDateKey(utcDateStr: string): string {
  const date = new Date(utcDateStr);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export function BettingScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Record<string, {
    betType: 'exact' | 'simple';
    exactHomeScore: number;
    exactAwayScore: number;
    simpleResult: 'home' | 'draw' | 'away';
    stake: number;
  }>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const { currentUser, addToast } = useApp();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetch('https://worldcup26.ir/get/games')
      .then(res => res.json())
<<<<<<< Updated upstream
      .then(data => setGames(data.games))
=======
      .then(data => {
        const gameList = data.games || [];
        setGames(gameList);
        
        // Select first date by default
        if (gameList.length > 0) {
          const dateKeys = [...new Set(gameList
            .filter(g => g.utc_date)
            .map(g => getBrazilianDateKey(g.utc_date!))
          )].sort();
          if (dateKeys.length > 0) {
            setSelectedDateKey(dateKeys[0]);
          }
        }
      })
>>>>>>> Stashed changes
      .catch(() => addToast('Erro ao carregar jogos', 'error'));
  }, [addToast]);

  // Group games by Brazilian date
  const groupedGames = games.reduce((acc, game) => {
    if (!game.utc_date) return acc;
    const dateKey = getBrazilianDateKey(game.utc_date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  // Get sorted date keys
  const sortedDateKeys = Object.keys(groupedGames).sort();

  const handleBetTypeChange = (gameId: string, betType: 'exact' | 'simple') => {
    setSelectedGames(prev => ({
      ...prev,
      [gameId]: {
        betType,
        exactHomeScore: 0,
        exactAwayScore: 0,
        simpleResult: 'home',
        stake: prev[gameId]?.stake || 10,
      }
    }));
  };

  const handleScoreChange = (gameId: string, team: 'home' | 'away', change: number) => {
    setSelectedGames(prev => {
      const current = prev[gameId] || { betType: 'exact', exactHomeScore: 0, exactAwayScore: 0, simpleResult: 'home', stake: 10 };
      return {
        ...prev,
        [gameId]: {
          ...current,
          [team === 'home' ? 'exactHomeScore' : 'exactAwayScore']: Math.max(0, (current[team === 'home' ? 'exactHomeScore' : 'exactAwayScore'] || 0) + change),
        }
      };
    });
  };

  const handleSimpleResultChange = (gameId: string, result: 'home' | 'draw' | 'away') => {
    setSelectedGames(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        betType: 'simple',
        simpleResult: result,
        exactHomeScore: 0,
        exactAwayScore: 0,
        stake: prev[gameId]?.stake || 10,
      }
    }));
  };

  const handleStakeChange = (gameId: string, stake: number) => {
    setSelectedGames(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        stake: Math.max(1, stake),
      }
    }));
  };

  const handlePlaceBet = async (game: Game) => {
    if (!currentUser) return;
    const gameBet = selectedGames[game.id];
    if (!gameBet) return;

    if (currentUser.balance < gameBet.stake) {
      addToast('Saldo insuficiente!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          matchId: game.id,
          homeTeam: game.home_team_name_en,
          awayTeam: game.away_team_name_en,
          betType: gameBet.betType,
          exactHomeScore: gameBet.exactHomeScore,
          exactAwayScore: gameBet.exactAwayScore,
          simpleResult: gameBet.simpleResult,
          stake: gameBet.stake,
        }),
      });
      if (res.ok) {
        addToast('Aposta realizada com sucesso!', 'success');
        setSelectedGames(prev => {
          const newState = { ...prev };
          delete newState[game.id];
          return newState;
        });
      } else {
        addToast('Erro ao realizar aposta', 'error');
      }
    } catch (err) {
      addToast('Erro no servidor', 'error');
    }
  };

  const currentGames = groupedGames[selectedDateKey] || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Apostas</h1>

      {/* Date Tabs */}
      {sortedDateKeys.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {sortedDateKeys.map(dateKey => {
            const date = new Date(groupedGames[dateKey][0].utc_date!);
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDateKey(dateKey)}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedDateKey === dateKey
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                {formatBrazilianDate(date)}
              </button>
            );
          })}
        </div>
      )}

      {/* Games Grid */}
      <div className="grid gap-6">
        {currentGames.map((game) => {
          const gameBet = selectedGames[game.id];
          const isFinished = game.finished === 'TRUE';
          const gameDate = game.utc_date ? new Date(game.utc_date) : null;

          return (
            <div key={game.id} className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Grupo {game.group}
                  </span>
                  {game.stadium_name && game.stadium_city && (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{game.stadium_name}, {game.stadium_city}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {gameDate && (
                    <>
                      <span className="text-xl font-bold text-white">
                        {formatBrazilianTime(gameDate)} - Horário de Brasília
                      </span>
                      <span className="text-sm text-zinc-500">
                        {formatLocalTime(gameDate, game.stadium_timezone || 'UTC')} local
                      </span>
                    </>
                  )}
                  {isFinished ? (
                    <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-semibold">
                      Finalizado
                    </span>
                  ) : game.time_elapsed !== 'notstarted' ? (
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      {game.time_elapsed}'
                    </span>
                  ) : (
                    <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">
                      Não Iniciado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 text-center">
                  <p className="text-xl font-bold text-white">{game.home_team_name_en}</p>
                </div>
                <div className="flex items-center gap-4 px-4">
                  {isFinished ? (
                    <>
                      <span className="text-4xl font-bold text-white">{game.home_score}</span>
                      <span className="text-2xl text-zinc-400">X</span>
                      <span className="text-4xl font-bold text-white">{game.away_score}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-zinc-500">?</span>
                      <span className="text-2xl text-zinc-400">X</span>
                      <span className="text-4xl font-bold text-zinc-500">?</span>
                    </>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xl font-bold text-white">{game.away_team_name_en}</p>
                </div>
              </div>

              {!isFinished && currentUser && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleBetTypeChange(game.id, 'exact')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        gameBet?.betType === 'exact' ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      Placar Exato
                    </button>
                    <button
                      onClick={() => handleBetTypeChange(game.id, 'simple')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        gameBet?.betType === 'simple' ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      Resultado
                    </button>
                  </div>

                  {gameBet?.betType === 'exact' && (
                    <div className="flex items-center justify-center gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-zinc-400 text-sm">{game.home_team_name_en}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleScoreChange(game.id, 'home', -1)}
                            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-red-600 transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-4xl font-bold text-white w-12 text-center">{gameBet.exactHomeScore}</span>
                          <button
                            onClick={() => handleScoreChange(game.id, 'home', 1)}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-green-600 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-4xl font-bold text-zinc-600">X</div>

                      <div className="flex flex-col items-center gap-2">
                        <span className="text-zinc-400 text-sm">{game.away_team_name_en}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleScoreChange(game.id, 'away', -1)}
                            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-red-600 transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-4xl font-bold text-white w-12 text-center">{gameBet.exactAwayScore}</span>
                          <button
                            onClick={() => handleScoreChange(game.id, 'away', 1)}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-green-600 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {gameBet?.betType === 'simple' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSimpleResultChange(game.id, 'home')}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                          gameBet.simpleResult === 'home' ? 'bg-green-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                      >
                        {game.home_team_name_en}
                      </button>
                      <button
                        onClick={() => handleSimpleResultChange(game.id, 'draw')}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                          gameBet.simpleResult === 'draw' ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                      >
                        Empate
                      </button>
                      <button
                        onClick={() => handleSimpleResultChange(game.id, 'away')}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                          gameBet.simpleResult === 'away' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                      >
                        {game.away_team_name_en}
                      </button>
                    </div>
                  )}

                  {gameBet && (
                    <div className="flex items-center justify-between bg-zinc-700/50 rounded-xl p-4">
                      <span className="text-zinc-300">Valor da Aposta</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStakeChange(game.id, gameBet.stake - 5)}
                          className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold hover:bg-red-600 transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-2xl font-bold text-white w-20 text-center">${gameBet.stake}</span>
                        <button
                          onClick={() => handleStakeChange(game.id, gameBet.stake + 5)}
                          className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {gameBet && (
                    <button
                      onClick={() => handlePlaceBet(game)}
                      disabled={currentUser.balance < gameBet.stake}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-6 h-6" />
                      Apostar ${gameBet.stake}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {currentGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Nenhum jogo encontrado para esta data</p>
          </div>
        )}
      </div>
    </div>
  );
}
