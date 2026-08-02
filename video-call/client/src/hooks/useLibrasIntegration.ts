import { useEffect, useRef } from 'react';
import { LibrasObserver } from 'libras-translator';
import type { SignRenderer } from 'libras-translator';
import { debugBus } from '../debug/event-bus.ts';
import { emitDebugEvent } from '../debug/debug-emitter.ts';
import type { ChatMessage } from './useChat.ts';

export interface LibrasIntegrationOptions {
  librasOnPeers?: string[]; // peers que têm libras aberto (para log)
}

export function useLibrasIntegration(
  messages: ChatMessage[],
  renderer: SignRenderer | null,
  options: LibrasIntegrationOptions = {},
): void {
  const observerRef = useRef<LibrasObserver | null>(null);
  const seenRef = useRef(0);

  useEffect(() => {
    if (!renderer) return;

    observerRef.current = new LibrasObserver(renderer, {
      onGlosa: (text, glosa, fromCache) => {
        debugBus.emit('libras', 'glosa:converted', {
          text: text.slice(0, 60),
          glosa: glosa.slice(0, 60),
          fromCache,
        });
        emitDebugEvent('glosa', '[system] glosa text received', {
          text: text.slice(0, 80),
          glosa: glosa.slice(0, 80),
          fromCache,
        });
        const recipients = options.librasOnPeers ?? [];
        emitDebugEvent('glosa', '[system] glosa sent to render', {
          glosa: glosa.slice(0, 80),
          recipients,
          recipientCount: recipients.length,
        });
      },
      onError: (text, error) => {
        debugBus.emit('libras', 'glosa:error', { text: text.slice(0, 60), error });
        emitDebugEvent('glosa', '[system] glosa error', { text: text.slice(0, 80), error });
        console.warn('[libras-observer] erro na tradução:', { text, error });
      },
    });

    return () => {
      observerRef.current?.clearCache();
      observerRef.current = null;
    };
  }, [renderer]);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    const newMessages = messages
      .slice(seenRef.current)
      .filter((m) => !m.isMine);

    seenRef.current = messages.length;
    if (newMessages.length === 0) return;

    const texts = newMessages.map((m) => m.text);
    debugBus.emit('audio', 'audio:captured', {
      texts: texts.map((t) => t.slice(0, 60)),
      count: texts.length,
    });
    emitDebugEvent('stt', '[system] audio received', {
      texts: texts.map((t) => t.slice(0, 80)),
      count: texts.length,
    });
    emitDebugEvent('stt', '[system] sent text to glosa converter', {
      count: texts.length,
    });

    observer.observe(texts);
  }, [messages]);
}
