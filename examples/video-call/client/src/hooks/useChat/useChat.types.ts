export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  ts: number;
  isMine: boolean;
}

export interface UseChatResult {
  messages: ChatMessage[];
  send: (text: string) => void;
}
