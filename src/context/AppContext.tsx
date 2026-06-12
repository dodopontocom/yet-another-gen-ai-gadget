import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Food, Bet, Toast, Screen } from '../types';

interface AppState {
  currentUser: User | null;
  onlineUsers: User[];
  foods: Food[];
  bets: Bet[];
  toasts: Toast[];
  currentScreen: Screen;
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  setOnlineUsers: (users: User[]) => void;
  setFoods: (foods: Food[]) => void;
  setBets: (bets: Bet[]) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  setCurrentScreen: (screen: Screen) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

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

  return (
    <AppContext.Provider value={{
      currentUser,
      onlineUsers,
      foods,
      bets,
      toasts,
      currentScreen,
      setCurrentUser,
      setOnlineUsers,
      setFoods,
      setBets,
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
