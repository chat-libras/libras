import { useEffect } from 'react';
import { useWebRTC } from '../../../../hooks/useWebRTC/index.ts';
import { useChat } from '../../../../hooks/useChat/index.ts';
import { useLibrasIntegration } from '../../../../hooks/useLibrasIntegration/index.ts';
import { useMediaEffects } from '../../../../hooks/useMediaEffects/index.ts';
import { useVAD } from '../../../../hooks/useVAD/index.ts';
import { useLibrasTranslator, type SignRenderer } from 'libras-translator';
import { useCallStore } from '../../../../store/useCallStore/index.ts';
import { useControlsStore } from '../../../../store/useControlsStore/index.ts';
import { VideoGrid } from '../../../../components/VideoGrid/index.ts';
import { ChatPanel } from '../../../../components/ChatPanel/index.ts';
import { MediaControls } from '../../../../components/MediaControls/index.ts';
import { BottomPanel } from '../../../../components/BottomPanel/index.ts';
import { Sidebar, type SidebarItem } from '../../../../components/Sidebar/index.ts';
import { ToastContainer } from '../../../../components/Toast/index.ts';
import { debugBus } from '../../../../debug/event-bus/index.ts';
import { initDebugEmitter, emitDebugEvent } from '../../../../debug/debug-emitter/index.ts';
import { getClientEnv } from '../../../../env.ts';
import { useAppTheme } from '../../../../theme/ThemeProvider.tsx';
import * as S from './styles.ts';
import type { CallScreenProps } from './component.types.ts';

const ROLE_LABELS: Record<string, string> = {
  PATIENT: '👤 Paciente',
  HEALTH_PROFESSIONAL: '🩺 Profissional de Saúde',
};

export function CallScreen({ params, onLeave }: CallScreenProps) {
  const { ws } = useWebRTC(params);
  const { localStream, remoteStreams, peers, peerMediaState, connected, error } = useCallStore();
  const {
    isCameraEnabled, isMicEnabled, isSoundEnabled, isLibrasOpen, isChatOpen, isDebugOpen,
    toggleCamera, toggleMic, toggleSound, toggleLibras, toggleChat, toggleDebug,
  } = useControlsStore();

  const chat   = useChat(ws, params.peerId, params.roomId);
  const libras = useLibrasTranslator({
    audio: { kind: 'microphone' },
    asr: { provider: 'webspeech', lang: 'pt-BR' },
    autoStart: true,
    speed: 1.3,
  });
  const { debugMode } = getClientEnv();
  const { theme, toggleTheme } = useAppTheme();

  useMediaEffects();

  useEffect(() => {
    if (debugMode) debugBus.enable();
    return () => { if (debugMode) debugBus.disable(); };
  }, [debugMode]);

  useEffect(() => {
    if (ws && debugMode) initDebugEmitter(ws, params.peerId, params.role, debugMode);
  }, [ws, debugMode, params.peerId, params.role]);

  const isLibrasActive = isLibrasOpen && (libras.status === 'ready' || libras.status === 'listening');
  const activeRenderer: SignRenderer | null = isLibrasActive
    ? { play: libras.translate, clear: () => {}, setSpeed: libras.setSpeed, get busy() { return false; }, get pending() { return 0; }, dispose: () => {} }
    : null;
  useLibrasIntegration(chat.messages, activeRenderer, { librasOnPeers: isLibrasOpen ? [params.peerId] : [] });

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

  const activeSidebarKey = isChatOpen ? 'chat' : isDebugOpen ? 'debug' : null;

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
      title: 'Debug',
      content: null,
    } satisfies SidebarItem] : []),
  ];

  const handleSidebarToggle = (key: string) => {
    if (key === 'chat') toggleChat();
    else if (key === 'debug') toggleDebug();
  };

  return (
    <S.Layout>
      <S.Header>
        <S.HeaderInfo>
          <S.Room>🏠 {params.roomId}</S.Room>
          <S.Role>{ROLE_LABELS[params.role] ?? params.role}</S.Role>
          <S.Status $connected={connected}>{connected ? '● Conectado' : '○ Conectando…'}</S.Status>
          {debugMode && <S.DebugBadge>🔬 DEBUG</S.DebugBadge>}
        </S.HeaderInfo>
        <S.ThemeBtn onClick={toggleTheme} title={theme.name === 'dark' ? 'Tema claro' : 'Tema escuro'}>
          <span className="material-icons">{theme.name === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </S.ThemeBtn>
      </S.Header>

      {error && <S.ErrorBanner>⚠️ {error}</S.ErrorBanner>}

      <S.Body>
        <S.Main>
          <S.VideoGridWrapper>
            <VideoGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              peers={peers}
              peerMediaState={peerMediaState}
              myId={params.peerId}
              cameraOn={isCameraEnabled}
              audioOn={isSoundEnabled}
              spotlightMode={peers.length > 0}
            />
          </S.VideoGridWrapper>
          <BottomPanel libras={libras} />
        </S.Main>

        <Sidebar items={sidebarItems} activeKey={activeSidebarKey} onToggle={handleSidebarToggle} />
      </S.Body>

      <MediaControls
        cameraOn={isCameraEnabled} micOn={isMicEnabled} audioOn={isSoundEnabled} librasOn={isLibrasOpen}
        showLibrasToggle
        onToggleCamera={toggleCamera} onToggleMic={toggleMic}
        onToggleAudio={toggleSound} onToggleLibras={toggleLibras}
        onLeave={onLeave}
      />

      <ToastContainer />
    </S.Layout>
  );
}
