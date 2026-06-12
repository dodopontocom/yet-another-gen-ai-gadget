import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './components/Dashboard';
import { MeuHistorico } from './components/MeuHistorico';
import { RankingFamilia } from './components/RankingFamilia';
import { LoginScreen } from './components/LoginScreen';
import { AvatarScreen } from './components/AvatarScreen';
import { BettingScreen } from './components/BettingScreen';

function AppContent() {
  const { currentScreen } = useApp();

  if (currentScreen === 'login') {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  if (currentScreen === 'avatar') {
    return (
      <>
        <AvatarScreen />
        <ToastContainer />
      </>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'apostas':
        return <BettingScreen />;
      case 'historico':
        return <MeuHistorico />;
      case 'ranking':
        return <RankingFamilia />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      <Sidebar />
      <main className="flex-1 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          {renderScreen()}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
