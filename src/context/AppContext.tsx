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
  // Load currentUser from localStorage on initial render
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? 'dashboard' : 'login';
  });

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

  const handleSetCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      onlineUsers,
      foods,
      bets,
      toasts,
      currentScreen,
      setCurrentUser: handleSetCurrentUser,
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
