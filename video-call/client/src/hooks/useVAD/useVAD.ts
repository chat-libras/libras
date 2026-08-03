import { useEffect, useRef } from 'react';
import type { VADOptions } from './useVAD.types.ts';

const POLL_MS = 100;

export function useVAD(
  streams: Map<string, MediaStream>,
  localStream: MediaStream | null,
  localPeerId: string,
  options: VADOptions,
): void {
  const { threshold = 0.015, silenceMs = 800, onSpeakStart, onSpeakStop } = options;
  const stateRef = useRef(new Map<string, { speaking: boolean; silenceSince: number }>());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    const analysers = new Map<string, AnalyserNode>();

    const attach = (id: string, stream: MediaStream) => {
      if (analysers.has(id)) return;
      try {
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analysers.set(id, analyser);
        stateRef.current.set(id, { speaking: false, silenceSince: 0 });
      } catch {
        // stream sem audio track — ignora
      }
    };

    streams.forEach((s, id) => attach(id, s));
    if (localStream) attach(localPeerId, localStream);

    const buf = new Uint8Array(256);
    const now = () => Date.now();

    intervalRef.current = setInterval(() => {
      streams.forEach((s, id) => attach(id, s));

      analysers.forEach((analyser, id) => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i]! - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        const state = stateRef.current.get(id)!;

        if (rms > threshold) {
          if (!state.speaking) {
            state.speaking = true;
            onSpeakStart(id);
          }
          state.silenceSince = 0;
        } else {
          if (state.speaking) {
            if (state.silenceSince === 0) state.silenceSince = now();
            if (now() - state.silenceSince > silenceMs) {
              state.speaking = false;
              onSpeakStop(id);
            }
          }
        }
      });
    }, POLL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ctx.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPeerId]);
}
