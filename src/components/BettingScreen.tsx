import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Game } from '../types';
import { Plus, Minus, Trophy, MapPin, Calendar } from 'lucide-react';

function formatBrazilianDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Sao_Paulo',
    });
  } catch {
    return dateStr;
  }
}

function formatBrazilianTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  } catch {
    return '';
  }
}

function formatLocalTime(dateStr: string, timezone?: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone || 'UTC',
    });
  } catch {
    return '';
  }
}

function getBrazilianDateKey(utcDateStr: string): string {
  try {
    const date = new Date(utcDateStr);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  } catch {
    return 'unknown';
  }
}

export function BettingScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState<Record<string, {
    betType: 'exact' | 'simple';
    exactHomeScore: number;
    exactAwayScore: number;
    simpleResult: 'home' | 'draw' | 'away';
    stake: number;
  }>>({});
  const { currentUser, addToast } = useApp();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Group games by date and get sorted date keys
  const groupedGames = games.reduce((acc, game) => {
    if (!game.utc_date) return acc;
    const dateKey = getBrazilianDateKey(game.utc_date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  const sortedDateKeys = Object.keys(groupedGames).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
  });

  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/games`);
        const data = await response.json();
        const gameList = (data.games || []) as Game[];
        setGames(gameList);
        // Auto-select first available date
        if (gameList.length > 0) {
          setCurrentDateIndex(0);
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        addToast('Erro ao carregar jogos', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [addToast, API_URL]);

  const handleBetTypeChange = (gameId: string, betType: 'exact' | 'simple') => {
    setSelectedGames(prev => ({
      ...prev,
      [gameId]: prev[gameId] || {
        betType,
        exactHomeScore: 0,
        exactAwayScore: 0,
        simpleResult: 'home',
        stake: 10,
      },
    }));
  };

  const handleScoreChange = (gameId: string, team: 'home' | 'away', delta: number) => {
    setSelectedGames(prev => {
      const current = prev[gameId] || {
        betType: 'exact',
        exactHomeScore: 0,
        exactAwayScore: 0,
        simpleResult: 'home',
        stake: 10,
      };

      const newScore = Math.max(0, Math.min(99, (current[team === 'home' ? 'exactHomeScore' : 'exactAwayScore'] || 0) + delta));

      return {
        ...prev,
        [gameId]: {
          ...current,
          [team === 'home' ? 'exactHomeScore' : 'exactAwayScore']: newScore,
        },
      };
    });
  };

  const handleSimpleResultChange = (gameId: string, result: 'home' | 'draw' | 'away') => {
    setSelectedGames(prev => ({
      ...prev,
      [gameId]: prev[gameId] || {
        betType: 'simple',
        exactHomeScore: 0,
        exactAwayScore: 0,
        simpleResult: result,
        stake: 10,
      },
    }));
  };

  const handleStakeChange = (gameId: string, delta: number) => {
    setSelectedGames(prev => {
      const current = prev[gameId] || {
        betType: 'exact',
        exactHomeScore: 0,
        exactAwayScore: 0,
        simpleResult: 'home',
        stake: 10,
      };

      const newStake = Math.max(1, Math.min(1000, current.stake + delta));

      return {
        ...prev,
        [gameId]: {
          ...current,
          stake: newStake,
        },
      };
    });
  };

  const handlePlaceBet = async (game: Game) => {
    if (!currentUser) {
      addToast('Você precisa estar logado para apostar', 'error');
      return;
    }

    const gameBet = selectedGames[game.id];
    if (!gameBet) {
      addToast('Selecione um tipo de aposta primeiro', 'error');
      return;
    }

    if (currentUser.balance < gameBet.stake) {
      addToast('Saldo insuficiente!', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/bets`, {
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

      if (response.ok) {
        addToast('Aposta realizada com sucesso!', 'success');
        // Clear the bet for this game
        setSelectedGames(prev => {
          const newState = { ...prev };
          delete newState[game.id];
          return newState;
        });
      } else {
        addToast('Erro ao realizar aposta', 'error');
      }
    } catch (err) {
      console.error('Error placing bet:', err);
      addToast('Erro no servidor', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-zinc-400">Carregando jogos...</p>
        </div>
      </div>
    );
  }

  const currentDateKey = sortedDateKeys[currentDateIndex];
  const currentGames = groupedGames[currentDateKey] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Apostas</h1>
        {currentUser && (
          <div className="bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700">
            <span className="text-zinc-400 text-sm">Saldo</span>
            <p className="text-2xl font-bold text-green-400">${currentUser.balance}</p>
          </div>
        )}
      </div>

      {/* Date Pagination */}
      {sortedDateKeys.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDateIndex(prev => Math.max(0, prev - 1))}
            disabled={currentDateIndex === 0}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-zinc-700 transition-all"
          >
            <Minus className="w-6 h-6" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 px-6 py-4 rounded-xl border border-zinc-700">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">
              {currentDateKey ? formatBrazilianDate(new Date(groupedGames[currentDateKey][0].utc_date!).toISOString()) : 'Nenhum jogo'}
            </h2>
            <span className="text-zinc-500">
              ({currentDateIndex + 1} / {sortedDateKeys.length})
            </span>
          </div>

          <button
            onClick={() => setCurrentDateIndex(prev => Math.min(sortedDateKeys.length - 1, prev + 1))}
            disabled={currentDateIndex === sortedDateKeys.length - 1}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-zinc-700 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Games List */}
      <div className="grid gap-6">
        {currentGames.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/50 rounded-2xl border border-zinc-700">
            <p className="text-zinc-400 text-lg">Nenhum jogo para esta data</p>
          </div>
        ) : (
          currentGames.map((game) => {
            const gameBet = selectedGames[game.id];
            const isFinished = game.finished === 'TRUE';
            const gameDate = game.utc_date ? new Date(game.utc_date) : null;

            return (
              <div key={game.id} className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50">
                {/* Game Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
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
                          {formatBrazilianTime(gameDate.toISOString())} - Horário de Brasília
                        </span>
                        <span className="text-sm text-zinc-500">
                          {formatLocalTime(gameDate.toISOString(), game.stadium_timezone)} local
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

                {/* Teams & Score */}
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

                {/* Betting UI - Only if not finished and user is logged in */}
                {!isFinished && currentUser && (
                  <div className="space-y-6 pt-4 border-t border-zinc-700/50">
                    {/* Bet Type Selector */}
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
                        Resultado Simples
                      </button>
                    </div>

                    {/* Exact Score UI */}
                    {gameBet?.betType === 'exact' && (
                      <div className="flex items-center justify-center gap-8">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-zinc-400 text-sm font-semibold">{game.home_team_name_en}</span>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleScoreChange(game.id, 'home', -1)}
                              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold transition-all"
                            >
                              <Minus className="w-6 h-6" />
                            </button>
                            <span className="text-5xl font-bold text-white w-16 text-center">
                              {gameBet.exactHomeScore || 0}
                            </span>
                            <button
                              onClick={() => handleScoreChange(game.id, 'home', 1)}
                              className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white font-bold transition-all"
                            >
                              <Plus className="w-6 h-6" />
                            </button>
                          </div>
                        </div>

                        <div className="text-5xl font-bold text-zinc-600">X</div>

                        <div className="flex flex-col items-center gap-3">
                          <span className="text-zinc-400 text-sm font-semibold">{game.away_team_name_en}</span>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleScoreChange(game.id, 'away', -1)}
                              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold transition-all"
                            >
                              <Minus className="w-6 h-6" />
                            </button>
                            <span className="text-5xl font-bold text-white w-16 text-center">
                              {gameBet.exactAwayScore || 0}
                            </span>
                            <button
                              onClick={() => handleScoreChange(game.id, 'away', 1)}
                              className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white font-bold transition-all"
                            >
                              <Plus className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Simple Result UI */}
                    {gameBet?.betType === 'simple' && (
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleSimpleResultChange(game.id, 'home')}
                          className={`py-4 rounded-xl font-semibold transition-all ${
                            gameBet.simpleResult === 'home' ? 'bg-green-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          }`}
                        >
                          {game.home_team_name_en}
                        </button>
                        <button
                          onClick={() => handleSimpleResultChange(game.id, 'draw')}
                          className={`py-4 rounded-xl font-semibold transition-all ${
                            gameBet.simpleResult === 'draw' ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          }`}
                        >
                          Empate
                        </button>
                        <button
                          onClick={() => handleSimpleResultChange(game.id, 'away')}
                          className={`py-4 rounded-xl font-semibold transition-all ${
                            gameBet.simpleResult === 'away' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          }`}
                        >
                          {game.away_team_name_en}
                        </button>
                      </div>
                    )}

                    {/* Stake Selector */}
                    {gameBet && (
                      <div className="flex items-center justify-between bg-zinc-700/50 rounded-xl p-4">
                        <span className="text-zinc-300 font-semibold">Valor da Aposta</span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleStakeChange(game.id, -5)}
                            className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center text-white font-bold transition-all"
                          >
                            <Minus className="w-6 h-6" />
                          </button>
                          <span className="text-3xl font-bold text-white w-20 text-center">${gameBet.stake}</span>
                          <button
                            onClick={() => handleStakeChange(game.id, 5)}
                            className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center text-white font-bold transition-all"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Place Bet Button */}
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
          })
        )}
      </div>
    </div>
  );
}
