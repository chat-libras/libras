import { useState } from 'react';
import type { CallParams } from '../App.tsx';

interface LobbyProps {
  onJoin: (params: CallParams) => void;
}

export function Lobby({ onJoin }: LobbyProps) {
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState('patient');

  const handleJoin = () => {
    if (!roomId.trim()) return;
    onJoin({
      roomId: roomId.trim(),
      peerId: crypto.randomUUID(),
      role,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="lobby">
      <div className="lobby__card">
        <h1 className="lobby__title">🤝 Libras Video Call</h1>
        <p className="lobby__subtitle">Harness de teste da lib libras-translator</p>

        <div className="lobby__form">
          <label className="lobby__label">
            ID da sala
            <input
              className="lobby__input"
              placeholder="ex: sala-consulta-01"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </label>

          <label className="lobby__label">
            Seu papel
            <select
              className="lobby__select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">👤 Paciente</option>
              <option value="professional">🩺 Profissional de Saúde</option>
            </select>
          </label>

          <button
            className="lobby__btn"
            onClick={handleJoin}
            disabled={!roomId.trim()}
          >
            Entrar na sala
          </button>
        </div>
      </div>
    </div>
  );
}
