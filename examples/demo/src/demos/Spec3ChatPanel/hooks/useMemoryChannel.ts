import { useState } from 'react';

/**
 * Simula um canal bidirecional em memória (análogo a um WebSocket local).
 * speakerMsg → o que o speaker enviou (chega como incoming no listener).
 * listenerMsg → o que o listener enviou (chega como incoming no speaker).
 */
export interface MemoryChannelApi {
  speakerMsg: string;
  listenerMsg: string;
  onSpeakerMessage: (text: string) => void;
  onListenerMessage: (text: string) => void;
}

export function useMemoryChannel(): MemoryChannelApi {
  const [speakerMsg, setSpeakerMsg] = useState('');
  const [listenerMsg, setListenerMsg] = useState('');

  return {
    speakerMsg,
    listenerMsg,
    onSpeakerMessage: setSpeakerMsg,
    onListenerMessage: setListenerMsg,
  };
}
