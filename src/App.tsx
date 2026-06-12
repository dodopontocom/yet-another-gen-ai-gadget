import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './components/Dashboard';
import { ApostasAtivas } from './components/ApostasAtivas';
import { MeuHistorico } from './components/MeuHistorico';
import { RankingFamilia } from './components/RankingFamilia';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'apostas':
        return <ApostasAtivas />;
      case 'historico':
        return <MeuHistorico />;
      case 'ranking':
        return <RankingFamilia />;
      default:
        return <Dashboard />;
    }
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Inicio';
      case 'apostas':
        return 'Apostas Ativas';
      case 'historico':
        return 'Meu Historico';
      case 'ranking':
        return 'Ranking da Familia';
      default:
        return 'Inicio';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
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
