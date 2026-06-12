import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FamilyMember, BettingEvent, PlacedBet, Toast, Screen } from '../types';

interface AppState {
  currentUser: FamilyMember;
  familyMembers: FamilyMember[];
  events: BettingEvent[];
  bets: PlacedBet[];
  toasts: Toast[];
  currentScreen: Screen;
}

interface AppContextType extends AppState {
  placeBet: (eventId: string, optionId: string, amount: number) => boolean;
  simulateResult: (betId: string, won: boolean) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  setCurrentScreen: (screen: Screen) => void;
}

const initialFamilyMembers: FamilyMember[] = [
  { id: 'user', name: 'Voce', avatar: '👤', balance: 10000 },
  { id: 'tio-joao', name: 'Tio Joao', avatar: '🎩', balance: 12500 },
  { id: 'mae', name: 'Mae', avatar: '👩', balance: 8500 },
  { id: 'primo-lucas', name: 'Primo Lucas', avatar: '🎮', balance: 15000 },
  { id: 'tia-maria', name: 'Tia Maria', avatar: '💃', balance: 7200 },
  { id: 'avo-pedro', name: 'Avo Pedro', avatar: '👴', balance: 9000 },
];

const initialEvents: BettingEvent[] = [
  {
    id: '1',
    title: 'Brasil vs Argentina - Final da Copa',
    category: 'football',
    deadline: '2026-06-15 16:00',
    options: [
      { id: '1a', label: 'Brasil vence', odds: 2.1 },
      { id: '1b', label: 'Argentina vence', odds: 2.3 },
      { id: '1c', label: 'Empate', odds: 3.5 },
    ],
  },
  {
    id: '2',
    title: 'Quem sera eliminado do BBB?',
    category: 'reality-show',
    deadline: '2026-06-12 20:00',
    options: [
      { id: '2a', label: 'Participante A', odds: 1.8 },
      { id: '2b', label: 'Participante B', odds: 2.5 },
      { id: '2c', label: 'Participante C', odds: 4.0 },
    ],
  },
  {
    id: '3',
    title: 'Jogo da Familia - Competicao de Truco',
    category: 'family-games',
    deadline: '2026-06-20 14:00',
    options: [
      { id: '3a', label: 'Tio Joao vence', odds: 2.0 },
      { id: '3b', label: 'Primo Lucas vence', odds: 2.8 },
      { id: '3c', label: 'Voce vence', odds: 3.2 },
    ],
  },
  {
    id: '4',
    title: 'Corrida de Kart do Domingo',
    category: 'family-games',
    deadline: '2026-06-16 10:00',
    options: [
      { id: '4a', label: 'Avo Pedro surpreende', odds: 5.0 },
      { id: '4b', label: 'Primo Lucas domina', odds: 1.5 },
      { id: '4c', label: 'Tia Maria vence', odds: 8.0 },
    ],
  },
  {
    id: '5',
    title: 'Flamengo vs Palmeiras - Brasileirao',
    category: 'football',
    deadline: '2026-06-18 19:00',
    options: [
      { id: '5a', label: 'Flamengo vence', odds: 1.9 },
      { id: '5b', label: 'Palmeiras vence', odds: 2.6 },
      { id: '5c', label: 'Empate', odds: 3.2 },
    ],
  },
];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FamilyMember>(initialFamilyMembers.find(m => m.id === 'user')!);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [events] = useState<BettingEvent[]>(initialEvents);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const placeBet = useCallback((eventId: string, optionId: string, amount: number): boolean => {
    if (amount > currentUser.balance) {
      addToast('Saldo insuficiente para esta aposta!', 'error');
      return false;
    }

    if (amount <= 0) {
      addToast('Digite um valor valido para apostar!', 'error');
      return false;
    }

    const event = events.find(e => e.id === eventId);
    const option = event?.options.find(o => o.id === optionId);

    if (!event || !option) {
      addToast('Erro ao processar aposta!', 'error');
      return false;
    }

    const newBet: PlacedBet = {
      id: Date.now().toString(),
      eventId,
      eventTitle: event.title,
      chosenOption: option.label,
      odds: option.odds,
      amount,
      status: 'pending',
      payout: 0,
      placedAt: new Date().toISOString(),
    };

    setBets(prev => [...prev, newBet]);
    setCurrentUser(prev => ({ ...prev, balance: prev.balance - amount }));
    setFamilyMembers(prev => prev.map(m =>
      m.id === 'user' ? { ...m, balance: m.balance - amount } : m
    ));

    addToast(`Aposta de $${amount.toLocaleString('pt-BR')} realizada com sucesso!`, 'success');
    return true;
  }, [currentUser.balance, events, addToast]);

  const simulateResult = useCallback((betId: string, won: boolean) => {
    const bet = bets.find(b => b.id === betId);
    if (!bet || bet.status !== 'pending') return;

    const payout = won ? bet.amount * bet.odds : 0;
    const newStatus = won ? 'won' : 'lost';

    setBets(prev => prev.map(b =>
      b.id === betId
        ? { ...b, status: newStatus, payout }
        : b
    ));

    if (won) {
      setCurrentUser(prev => ({ ...prev, balance: prev.balance + payout }));
      setFamilyMembers(prev => prev.map(m =>
        m.id === 'user' ? { ...m, balance: m.balance + payout } : m
      ));
      addToast(`Parabens! Voce ganhou $${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}!`, 'success');
    } else {
      addToast(`Que pena! Voce perdeu $${bet.amount.toLocaleString('pt-BR')}.`, 'info');
    }
  }, [bets, addToast]);

  return (
    <AppContext.Provider value={{
      currentUser,
      familyMembers,
      events,
      bets,
      toasts,
      currentScreen,
      placeBet,
      simulateResult,
      addToast,
      removeToast,
      setCurrentScreen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
