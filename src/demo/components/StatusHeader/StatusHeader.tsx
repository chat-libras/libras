import { statusLabel } from '../../utils/statusLabel';
import type { StatusHeaderProps } from '../../interfaces/StatusHeaderProps';
import './StatusHeader.css';

// Cabeçalho da demo com o título e o selo de status ao vivo.
export function StatusHeader({ status, listening }: StatusHeaderProps) {
  return (
    <header className="tm__header">
      <h1>TeleSaúde + Libras</h1>
      <span className={`tm__status tm__status--${status}`}>{statusLabel(status, listening)}</span>
    </header>
  );
}
