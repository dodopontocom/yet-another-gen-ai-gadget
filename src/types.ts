export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  balance: number;
}

export interface BetOption {
  id: string;
  label: string;
  odds: number;
}

export interface BettingEvent {
  id: string;
  title: string;
  category: 'football' | 'reality-show' | 'family-games' | 'other';
  deadline: string;
  options: BetOption[];
}

export interface PlacedBet {
  id: string;
  eventId: string;
  eventTitle: string;
  chosenOption: string;
  odds: number;
  amount: number;
  status: 'pending' | 'won' | 'lost';
  payout: number;
  placedAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Screen = 'dashboard' | 'apostas' | 'historico' | 'ranking';
