import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWebRTC } from '../hooks/useWebRTC.ts';
import { useChat } from '../hooks/useChat.ts';
import { useLibrasIntegration } from '../hooks/useLibrasIntegration.ts';
import { useVAD } from '../hooks/useVAD.ts';
import { useLibrasAvatar } from 'libras-translator';
import { useCallStore } from '../store/useCallStore.ts';
import { VideoGrid } from '../components/VideoGrid/index.ts';
import { ChatPanel } from '../components/ChatPanel/index.ts';
import { MediaControls } from '../components/MediaControls/index.ts';
import { DebugPanel } from '../components/DebugPanel/index.ts';
import { Sidebar, type SidebarItem } from '../components/Sidebar/index.ts';
import { ToastContainer } from '../components/Toast/index.ts';
import { debugBus } from '../debug/event-bus.ts';
import { initDebugEmitter, emitDebugEvent } from '../debug/debug-emitter.ts';
import { getClientEnv } from '../env.ts';
import { useAppTheme } from '../theme/ThemeProvider.tsx';
import type { CallParams } from '../App.tsx';

const AvatarContainer = styled.div`
  background: ${({ theme }) => theme.bg.tile};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 12px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const AvatarHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 8px;
`;

interface CallProps {
  params: CallParams;
  onLeave: () => void;
}

export function Call({ params, onLeave }: CallProps) {
  // Setup WS + PeerConnections (alimenta o store)
  const { ws } = useWebRTC(params);

  // Estado da chamada vem do store
  const {
    localStream, remoteStreams, peers, peerMediaState,
    connected, error,
    cameraOn, micOn, audioOn, librasOn,
    toggleCamera, toggleMic, toggleAudio, toggleLibras,
  } = useCallStore();

  const chat = useChat(ws, params.peerId, params.roomId);
  const avatar = useLibrasAvatar({ speed: 1.3 });
  const { debugMode } = getClientEnv();
  const { theme, toggleTheme } = useAppTheme();

  // Habilita o debugBus imediatamente quando debugMode está ativo
  useEffect(() => {
    if (debugMode) debugBus.enable();
    return () => { if (debugMode) debugBus.disable(); };
  }, [debugMode]);

  const [sidebarKey, setSidebarKey] = useState<string | null>(null);
  const toggleSidebar = (key: string) =>
    setSidebarKey((prev) => (prev === key ? null : key));

  // Avatar só monta após a primeira vez que libras for ligado.
  // Depois que montou, nunca desmonta (canvas Unity não sobrevive a unmount).
  const [librasEverOn, setLibrasEverOn] = useState(false);
  useEffect(() => {
    if (librasOn && !librasEverOn) setLibrasEverOn(true);
  }, [librasOn, librasEverOn]);

  // Inicializa debug emitter quando WS conectar
  useEffect(() => {
    if (ws && debugMode) {
      initDebugEmitter(ws, params.peerId, params.role);
    }
  }, [ws, debugMode, params.peerId, params.role]);

  const activeRenderer = librasOn && avatar.status === 'ready' ? avatar.renderer : null;
  useLibrasIntegration(chat.messages, activeRenderer, { librasOnPeers: librasOn ? [params.peerId] : [] });

  // VAD — só quando debug mode ativo
  useVAD(
    debugMode ? remoteStreams : new Map(),
    debugMode ? localStream : null,
    params.peerId,
    {
      onSpeakStart: (peerId) => {
        const isLocal = peerId === params.peerId;
        const role = isLocal ? params.role : (peers.find((p) => p.id === peerId)?.role ?? 'peer');
        emitDebugEvent('vad', `[${role}] is speaking`, { peerId, isLocal });
      },
      onSpeakStop: (peerId) => {
        const isLocal = peerId === params.peerId;
        const role = isLocal ? params.role : (peers.find((p) => p.id === peerId)?.role ?? 'peer');
        emitDebugEvent('vad', `[${role}] has stopped speaking`, { peerId, isLocal });
      },
    },
  );

  useEffect(() => {
    const onFocus = () => debugBus.emit('focus', 'focus:change', { state: 'gained' });
    const onBlur  = () => debugBus.emit('focus', 'focus:change', { state: 'lost' });
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const debugOpen = sidebarKey === 'debug';

  const sidebarItems: SidebarItem[] = [
    {
      key: 'chat',
      icon: 'chat',
      title: 'Chat',
      content: <ChatPanel messages={chat.messages} onSend={chat.send} peers={peers} />,
    },
    ...(debugMode ? [{
      key: 'debug',
      icon: 'bug_report',
      title: 'Debug — abre painel abaixo do vídeo',
      content: null,
    } satisfies SidebarItem] : []),
  ];

  return (
    <div className="call-layout">
      <header className="call-header">
        <div className="call-header__info">
          <span className="call-header__room">🏠 {params.roomId}</span>
          <span className="call-header__role">{roleLabel(params.role)}</span>
          <span className={`call-header__status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● Conectado' : '○ Conectando…'}
          </span>
          {debugMode && <span className="call-header__debug-badge">🔬 DEBUG</span>}
        </div>
        <button
          className="call-header__theme-btn"
          onClick={toggleTheme}
          title={theme.name === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          <span className="material-icons">
            {theme.name === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </header>

      {error && <div className="call-error">⚠️ {error}</div>}

      <div className="call-body">
        <div className="call-main">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            peers={peers}
            peerMediaState={peerMediaState}
            myId={params.peerId}
            cameraOn={cameraOn}
            audioOn={audioOn}
            spotlightMode={!librasOn}
          />

          {/* Área inferior: Libras + Debug. Container só monta após libras ser ligado pela 1ª vez. */}
          {(librasEverOn || debugOpen) && (
            <div className={`call-bottom-area${debugOpen ? ' call-bottom-area--split' : ''}`}>
              {librasEverOn && (
                <AvatarContainer style={{ display: librasOn ? undefined : 'none' }}>
                  <div ref={avatar.containerRef} className="libras-stage" />
                  {avatar.status === 'loading' && <AvatarHint>⏳ Carregando avatar VLibras…</AvatarHint>}
                  {avatar.status === 'error'   && <AvatarHint style={{ color: '#f87171' }}>⚠️ Erro: {avatar.error}</AvatarHint>}
                  {avatar.status === 'ready'   && <AvatarHint>🤟 Pronto — sinalizando mensagens</AvatarHint>}
                </AvatarContainer>
              )}
              {debugMode && debugOpen && <DebugPanel />}
            </div>
          )}
        </div>

        <Sidebar
          items={sidebarItems}
          activeKey={sidebarKey}
          onToggle={toggleSidebar}
        />
      </div>

      <MediaControls
        cameraOn={cameraOn}
        micOn={micOn}
        audioOn={audioOn}
        librasOn={librasOn}
        showLibrasToggle
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onToggleAudio={toggleAudio}
        onToggleLibras={toggleLibras}
        onLeave={onLeave}
      />

      <ToastContainer />
    </div>
  );
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    patient: '👤 Paciente',
    professional: '🩺 Profissional de Saúde',
  };
  return labels[role] ?? role;
}
