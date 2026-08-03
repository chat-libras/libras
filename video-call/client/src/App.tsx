import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CreateSessionPage } from './pages/createSession/index.tsx';
import { CreateLinksPage } from './pages/createLinks/index.tsx';
import { VideoCallPage } from './pages/videoCall/index.tsx';
import { AppThemeProvider } from './theme/ThemeProvider.tsx';
import type { RoomModel } from './modules/room/room.model.ts';
import type { CallParams } from './domain/types/index.ts';

export type { CallParams };

function HomeRoute() {
  const [room, setRoom] = useState<RoomModel | null>(null);

  if (room) return <CreateLinksPage room={room} />;
  return <CreateSessionPage onCreated={setRoom} />;
}

function VideoCallRoute() {
  const { sessionId, participantId } = useParams<{ sessionId: string; participantId: string }>();
  const navigate = useNavigate();

  if (!sessionId || !participantId) return <Navigate to="/" replace />;

  return (
    <VideoCallPage
      sessionId={sessionId}
      participantId={participantId}
      onLeave={() => navigate('/')}
    />
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/sala/:sessionId/:participantId" element={<VideoCallRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppThemeProvider>
  );
}
