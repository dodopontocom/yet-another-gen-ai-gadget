import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock } from 'lucide-react';

export function LoginScreen() {
  const [pin, setPin] = useState('');
  const { addToast, setCurrentScreen } = useApp();

  const handleKeyPress = (num: string) => {
    if (pin.length < 3) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        addToast('PIN correto!', 'success');
        setCurrentScreen('avatar');
      } else {
        addToast('PIN incorreto!', 'error');
        setPin('');
      }
    } catch (err) {
      addToast('Erro no servidor!', 'error');
    }
  };

  const numPad = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bolão da Família</h1>
          <p className="text-white/70">Digite o PIN de 3 dígitos</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-16 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-2 border-white/30"
            >
              {pin[i] || ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {numPad.map((row, rowIndex) => (
            row.map((num, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => num === 'delete' ? handleDelete() : num ? handleKeyPress(num) : null}
                disabled={!num && num !== 'delete'}
                className={`h-20 rounded-2xl text-3xl font-bold text-white transition-all active:scale-95 ${
                  num === 'delete'
                    ? 'bg-red-500/80 hover:bg-red-500'
                    : num
                    ? 'bg-white/20 hover:bg-white/30 border border-white/30'
                    : 'invisible'
                }`}
              >
                {num === 'delete' ? '⌫' : num}
              </button>
            ))
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.length !== 3}
          className="w-full mt-8 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
