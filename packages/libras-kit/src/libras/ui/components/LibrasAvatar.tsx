import { useCallback, useRef, useState } from 'react';
import { useLibrasTranslator } from '../hooks/useLibrasTranslator';
import { useLibrasConfig } from '../context/LibrasProvider';
import { resolveStrings } from '../consts/strings';
import type { LibrasAvatarProps, LibrasMessage } from '../interfaces/LibrasAvatar';

/**
 * Componente headless: avatar VLibras com chat opcional.
 *
 * - `showChat={false}` (default): só o avatar, traduz automaticamente o microfone.
 * - `showChat={true}`: avatar + histórico de mensagens + campo de texto.
 * - Sem classes CSS padrão — estilize via `classNames` e `styles`.
 *
 * @example
 * // Microfone, sem chat
 * <LibrasAvatar />
 *
 * @example
 * // Stream de chamada com chat visível
 * <LibrasAvatar
 *   audio={{ kind: 'stream', stream }}
 *   asr={{ provider: 'custom', factory: myASRFactory }}
 *   showChat
 *   classNames={{ root: 'widget', avatar: 'avatar', chat: 'chat' }}
 *   onSend={(text) => socket.emit('message', text)}
 * />
 */
export function LibrasAvatar({
  audio,
  asr,
  autoStart = true,
  vlibras,
  speed = 1,
  showChat = false,
  onSend,
  onTranscript,
  classNames,
  styles,
  strings: stringsProp,
}: LibrasAvatarProps) {
  const ctx = useLibrasConfig();
  const strings = resolveStrings({ ...ctx.strings, ...stringsProp });

  const [messages, setMessages] = useState<LibrasMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addMessage = useCallback((text: string, source: LibrasMessage['source']) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), text, source }]);
  }, []);

  const libras = useLibrasTranslator({
    audio: audio ?? ctx.audio,
    asr: asr ?? ctx.asr,
    vlibras: vlibras ?? ctx.vlibras,
    autoStart,
    speed,
    onTranscript: (text) => {
      addMessage(text, 'speech');
      onTranscript?.(text);
    },
  });

  // Mantém ref para o último valor do input (evita closure stale no onSubmit)
  const inputRef = useRef(inputValue);
  inputRef.current = inputValue;

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputRef.current.trim();
      if (!text) return;
      libras.translate(text);
      addMessage(text, 'typed');
      onSend?.(text);
      setInputValue('');
    },
    [libras, addMessage, onSend],
  );

  return (
    <div className={classNames?.root} style={styles?.root}>
      <div
        ref={libras.containerRef}
        className={classNames?.avatar}
        style={styles?.avatar}
        role="img"
        aria-label={strings.avatarAriaLabel}
      />

      {libras.status === 'loading' && (
        <div aria-live="polite">{strings.avatarLoading}</div>
      )}
      {libras.status === 'error' && (
        <div role="alert">{libras.error}</div>
      )}

      {showChat && (
        <div className={classNames?.chat} style={styles?.chat}>
          <ul className={classNames?.messages} style={styles?.messages}>
            {messages.map((m) => (
              <li
                key={m.id}
                className={classNames?.message}
                style={styles?.message}
                data-source={m.source}
              >
                {m.text}
              </li>
            ))}
          </ul>

          <form onSubmit={handleSend}>
            <input
              className={classNames?.input}
              style={styles?.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={strings.inputPlaceholder}
              aria-label={strings.inputPlaceholder}
              disabled={libras.status === 'loading' || libras.status === 'error'}
            />
            <button type="submit">{strings.inputSendButton}</button>
            <button
              type="button"
              onClick={libras.listening ? libras.stop : libras.start}
              aria-pressed={libras.listening}
              disabled={libras.status === 'loading' || libras.status === 'error'}
            >
              {libras.listening ? strings.micStop : strings.micStart}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
