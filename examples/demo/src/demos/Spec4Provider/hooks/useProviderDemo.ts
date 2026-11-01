import { useState } from 'react';

export interface ProviderDemoApi {
  speakerMsg: string;
  listenerMsg: string;
  onSpeakerMessage: (text: string) => void;
  onListenerMessage: (text: string) => void;
  customLabel: string;
  onCustomLabelChange: (label: string) => void;
}

export function useProviderDemo(): ProviderDemoApi {
  const [speakerMsg, setSpeakerMsg] = useState('');
  const [listenerMsg, setListenerMsg] = useState('');
  const [customLabel, setCustomLabel] = useState('Enviar ✓');

  return {
    speakerMsg,
    listenerMsg,
    onSpeakerMessage: setSpeakerMsg,
    onListenerMessage: setListenerMsg,
    customLabel,
    onCustomLabelChange: setCustomLabel,
  };
}
