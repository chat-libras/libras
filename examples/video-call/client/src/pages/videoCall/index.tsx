import { useEffect } from 'react';
import { useResolveSession } from './store/resolveSession.store.ts';
import { LoadingScreen } from './components/loadingScreen/index.ts';
import { ErrorScreen } from './components/errorScreen/index.ts';
import { CallScreen } from './components/callScreen/index.ts';

interface VideoCallPageProps {
  sessionId: string;
  participantId: string;
  onLeave: () => void;
}

export function VideoCallPage({ sessionId, participantId, onLeave }: VideoCallPageProps) {
  const { params, loading, error, resolve } = useResolveSession();

  useEffect(() => {
    resolve(sessionId, participantId);
  }, [sessionId, participantId]);

  if (loading || (!params && !error)) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onBack={onLeave} />;
  return <CallScreen params={params!} onLeave={onLeave} />;
}
