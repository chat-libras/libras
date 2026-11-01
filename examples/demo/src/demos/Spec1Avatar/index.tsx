/**
 * Spec 1 — Avatar com posição livre (useLibrasTranslator)
 *
 * Padrão demonstrado: hook retorna containerRef — você o anexa em qualquer
 * <div> e posiciona com CSS puro. O plugin não conhece o layout.
 *
 * Fluxo:
 *   useAvatarDemo()                    → texto local + libras API
 *     → AvatarControls (status, mic, speed, input)
 *     → <div ref={libras.containerRef} />  (avatar monta aqui)
 */
import { useAvatarDemo } from './hooks/useAvatarDemo';
import { AvatarControls } from './components/AvatarControls';

export function Spec1Avatar() {
  const { libras, text, onTextChange, onSend } = useAvatarDemo();

  return (
    <div className="spec1">
      <AvatarControls
        libras={libras}
        text={text}
        onTextChange={onTextChange}
        onSend={onSend}
      />

      <div className="spec1__avatar-area">
        <p className="spec1__avatar-label">containerRef ↓ (qualquer div, CSS livre)</p>
        <div ref={libras.containerRef} className="spec1__avatar-box" />
      </div>
    </div>
  );
}
