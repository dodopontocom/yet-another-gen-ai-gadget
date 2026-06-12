import { Home, TrendingUp, History, Trophy, Menu, X, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Screen } from '../types';
import { useState } from 'react';

const navItems: { id: Screen; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'apostas', label: 'Apostas Ativas', icon: TrendingUp },
  { id: 'historico', label: 'Meu Historico', icon: History },
  { id: 'ranking', label: 'Ranking da Familia', icon: Trophy },
];

export function Sidebar() {
  const { currentScreen, setCurrentScreen, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
          <h1 className="text-lg font-bold text-white">Bolao da Familia</h1>
        </div>
        <div className="flex items-center gap-2 bg-amber-500 px-3 py-1.5 rounded-full">
          <Wallet className="w-4 h-4 text-zinc-900" />
          <span className="text-sm font-bold text-zinc-900">
            ${currentUser.balance.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 lg:transform-none flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800 hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-zinc-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Bolao da</h1>
              <p className="text-sm text-amber-400 font-semibold">Familia</p>
            </div>
          </div>
        </div>

        {/* User Balance Card - Desktop */}
        <div className="p-4 hidden lg:block">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl p-4 text-zinc-900">
            <p className="text-sm font-medium opacity-80">Saldo Disponivel</p>
            <p className="text-3xl font-bold mt-1">
              ${currentUser.balance.toLocaleString('pt-BR')}
            </p>
            <div className="mt-3 pt-3 border-t border-amber-600/30">
              <p className="text-xs font-medium">Bem-vindo de volta!</p>
              <p className="font-semibold">{currentUser.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 pt-20 lg:pt-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentScreen(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-amber-500 text-zinc-900 font-semibold shadow-lg shadow-amber-500/20'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            Bolao da Familia v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
