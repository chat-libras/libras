import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Lobby } from './pages/Lobby.tsx';
import { Call } from './pages/Call.tsx';
import { AppThemeProvider } from './theme/ThemeProvider.tsx';

export interface CallParams {
  roomId: string;
  peerId: string;
  role: string;
}

function LobbyRoute() {
  const navigate = useNavigate();
  const handleJoin = (params: CallParams) => {
    navigate(`/sala/${params.roomId}/${params.role}`, { state: params });
  };
  return <Lobby onJoin={handleJoin} />;
}

function CallRoute() {
  const { roomId, role } = useParams<{ roomId: string; role: string }>();
  const navigate = useNavigate();
  const [params] = useState<CallParams>(() => {
    const nav = (window.history.state as { usr?: CallParams })?.usr;
    return nav ?? {
      roomId: roomId ?? 'sala',
      peerId: crypto.randomUUID(),
      role: role ?? 'patient',
    };
  });

  return (
    <Call
      params={{ ...params, roomId: roomId ?? params.roomId, role: role ?? params.role }}
      onLeave={() => navigate('/')}
    />
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyRoute />} />
          <Route path="/sala/:roomId/:role" element={<CallRoute />} />
          <Route path="/sala/:roomId" element={<Navigate to="patient" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppThemeProvider>
  );
}
