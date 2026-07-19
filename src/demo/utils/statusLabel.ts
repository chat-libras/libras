// Traduz o status do tradutor de Libras para um rótulo legível em português.
export function statusLabel(status: string, listening: boolean): string {
  if (status === 'loading') return 'carregando';
  if (status === 'error') return 'erro';
  if (listening) return 'traduzindo ao vivo';
  return 'pronto';
}
