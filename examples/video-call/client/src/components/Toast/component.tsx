import { useState, useEffect } from 'react';
import { useToastStore, type ToastVariant } from '../../store/useToastStore/index.ts';
import { Container, ToastItem, Icon, Message, CloseBtn, VARIANT_ICON } from './styles.ts';

function ToastEntry({ id, message, variant, duration }: {
  id: string; message: string; variant: ToastVariant; duration: number;
}) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [exiting, setExiting] = useState(false);

  const leave = () => {
    setExiting(true);
    setTimeout(() => dismiss(id), 260);
  };

  // Auto-dismiss: começa a animação de saída 260ms antes do fim
  useEffect(() => {
    const t = setTimeout(leave, duration - 260);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastItem $variant={variant} $exiting={exiting} onClick={leave}>
      <Icon $variant={variant} className="material-icons">{VARIANT_ICON[variant]}</Icon>
      <Message>{message}</Message>
      <CloseBtn onClick={(e) => { e.stopPropagation(); leave(); }}>
        <span className="material-icons" style={{ fontSize: 16 }}>close</span>
      </CloseBtn>
    </ToastItem>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <Container>
      {toasts.map((t) => (
        <ToastEntry key={t.id} {...t} />
      ))}
    </Container>
  );
}
