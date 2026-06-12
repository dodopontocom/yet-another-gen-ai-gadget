import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar as AvatarType } from '../types';
import { Smile } from 'lucide-react';

export function AvatarScreen() {
  const [avatars, setAvatars] = useState<AvatarType[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const { addToast, setCurrentScreen, setCurrentUser } = useApp();

  useEffect(() => {
    fetch('http://localhost:3001/api/users/avatars')
      .then(res => res.json())
      .then(data => setAvatars(data))
      .catch(() => addToast('Erro ao carregar avatares', 'error'));
  }, [addToast]);

  const handleSelect = (avatar: AvatarType) => {
    if (!avatar.taken) {
      setSelectedAvatar(avatar);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAvatar) return;
    try {
      const res = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedAvatar.name,
          emoji: selectedAvatar.emoji,
          sessionId: Math.random().toString(36).substr(2, 9),
        }),
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        addToast(`Bem-vindo, ${user.name}!`, 'success');
        setCurrentScreen('dashboard');
      } else {
        addToast('Erro ao selecionar avatar', 'error');
      }
    } catch (err) {
      addToast('Erro no servidor', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Smile className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Escolha seu Avatar</h1>
          <p className="text-white/70">Selecione um avatar único para você</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8">
          {avatars.map((avatar, index) => (
            <button
              key={index}
              onClick={() => handleSelect(avatar)}
              disabled={avatar.taken}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAvatar?.emoji === avatar.emoji
                  ? 'bg-yellow-400 ring-4 ring-yellow-300 scale-110 shadow-xl'
                  : avatar.taken
                  ? 'bg-gray-500/30 opacity-50 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-105 border border-white/30'
              }`}
            >
              <span className="text-4xl">{avatar.emoji}</span>
              <span className={`text-xs font-semibold px-2 ${selectedAvatar?.emoji === avatar.emoji ? 'text-gray-800' : 'text-white/80'}`}>
                {avatar.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedAvatar}
          className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
