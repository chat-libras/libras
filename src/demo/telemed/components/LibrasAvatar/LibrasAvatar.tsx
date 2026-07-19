import type { LibrasAvatarProps } from "../../interfaces/LibrasAvatarProps";
import "./LibrasAvatar.css";

// Avatar de Libras — elemento principal. O container é anexado ao ref do hook,
// que renderiza o player do VLibras dentro dele.
export function LibrasAvatar({
  containerRef,
  status,
  error,
}: LibrasAvatarProps) {
  return (
    <aside className="tm__avatar">
      <div ref={containerRef} className="tm__avatar-stage" />
      {status === "loading" && (
        <div className="tm__overlay">Carregando avatar…</div>
      )}
      {status === "error" && (
        <div className="tm__overlay tm__overlay--error">{error}</div>
      )}
      <span className="tm__badge">🤟 Libras</span>
    </aside>
  );
}
