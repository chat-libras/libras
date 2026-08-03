import styled, { css, keyframes } from 'styled-components';
import type { ToastVariant } from '../../store/useToastStore/index.ts';

const slideIn = keyframes`
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(110%); opacity: 0; }
`;

export const Container = styled.div`
  position: fixed;
  bottom: 88px; /* acima da barra de controles */
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
`;

const VARIANT_COLORS = {
  info:    { bg: '#1e293b', border: '#334155', icon: 'info',          iconColor: '#60a5fa' },
  success: { bg: '#14532d', border: '#166534', icon: 'check_circle',  iconColor: '#4ade80' },
  warning: { bg: '#451a03', border: '#78350f', icon: 'warning',       iconColor: '#fbbf24' },
  error:   { bg: '#450a0a', border: '#7f1d1d', icon: 'error',         iconColor: '#f87171' },
};

export const ToastItem = styled.div<{ $variant: ToastVariant; $exiting: boolean }>`
  ${({ $variant, $exiting }) => {
    const c = VARIANT_COLORS[$variant];
    return css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      min-width: 260px;
      max-width: 360px;
      background: ${c.bg};
      border: 1px solid ${c.border};
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      pointer-events: all;
      cursor: pointer;
      animation: ${$exiting ? slideOut : slideIn} 0.28s ease forwards;

      &:hover {
        filter: brightness(1.1);
      }
    `;
  }}
`;

export const Icon = styled.span<{ $variant: ToastVariant }>`
  ${({ $variant }) => css`
    font-size: 20px;
    flex-shrink: 0;
    color: ${VARIANT_COLORS[$variant].iconColor};
    user-select: none;
  `}
`;

export const Message = styled.span`
  font-size: 13px;
  line-height: 1.4;
  color: #f1f5f9;
  flex: 1;
`;

export const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-size: 16px;

  &:hover {
    color: #f1f5f9;
  }
`;

export const VARIANT_ICON: Record<ToastVariant, string> = {
  info:    'info',
  success: 'check_circle',
  warning: 'warning',
  error:   'error',
};
