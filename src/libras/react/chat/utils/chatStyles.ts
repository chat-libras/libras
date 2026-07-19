// Estilos padrão do chat, injetados uma única vez pelo useChatStyles.
// Sobrescreva pelas classes (`libras-chat__*`) ou via a prop `className`.
export const CHAT_CSS = `
.libras-chat { display: flex; flex-direction: column; gap: 10px; font-family: system-ui, sans-serif; }
.libras-chat__stage { width: 100%; aspect-ratio: 4/3; background: #111; border-radius: 10px; }
.libras-chat__log { height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: #fff; border-radius: 8px; border: 1px solid #eee; }
.libras-chat__bubble { max-width: 85%; padding: 6px 10px; border-radius: 10px; background: #eef1f4; color: #000; font-size: 14px; align-self: flex-start; }
.libras-chat__bubble--mine { align-self: flex-end; background: #d7ebff; }
.libras-chat__who { display: block; font-size: 10px; color: #888; text-transform: uppercase; }
.libras-chat__interim { color: #a60; font-size: 13px; }
.libras-chat__error { color: crimson; font-size: 13px; }
.libras-chat__form { display: flex; gap: 6px; }
.libras-chat__form input { flex: 1; padding: 8px; }
.libras-chat__form button { padding: 8px 12px; cursor: pointer; }
.libras-chat__mic--on { background: #ffd7d7; }
`;
