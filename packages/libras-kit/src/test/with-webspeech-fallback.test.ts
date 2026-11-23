import { describe, it, expect, vi } from 'vitest';
import { withWebSpeechFallback } from '../libras/core/asr/with-webspeech-fallback';
import type { ASRFactory, CloudASR, CloudASRCallbacks } from '../libras/core/asr/cloud-asr';

// Factory que funciona sem erros
function makeOkFactory(): { factory: ASRFactory; started: string[] } {
  const started: string[] = [];
  const factory: ASRFactory = (_cb: CloudASRCallbacks): CloudASR => ({
    async start(stream: MediaStream) { started.push(stream?.id ?? 'no-stream'); },
    stop() {},
  });
  return { factory, started };
}

// Factory que sempre joga erro em start()
function makeFailFactory(): ASRFactory {
  return (_cb: CloudASRCallbacks): CloudASR => ({
    async start() { throw new Error('primary failed'); },
    stop() {},
  });
}

// MediaStream mínimo para teste (sem tracks)
function emptyStream(): MediaStream {
  return { id: 'stream-1', getAudioTracks: () => [] } as unknown as MediaStream;
}

function streamWithTrack(): MediaStream {
  return {
    id: 'stream-2',
    getAudioTracks: () => [{ kind: 'audio' }],
  } as unknown as MediaStream;
}

describe('withWebSpeechFallback', () => {
  it('usa o primary quando o stream tem tracks e start() não joga erro', async () => {
    const { factory, started } = makeOkFactory();
    const wrapped = withWebSpeechFallback(factory);
    const cb: CloudASRCallbacks = { onTranscript: vi.fn(), onError: vi.fn() };
    const instance = wrapped(cb);
    await instance.start(streamWithTrack());
    expect(started).toHaveLength(1);
  });

  it('cai no fallback quando o stream não tem tracks de áudio', async () => {
    const { factory, started } = makeOkFactory();
    const wrapped = withWebSpeechFallback(factory);
    const onError = vi.fn();
    const cb: CloudASRCallbacks = { onTranscript: vi.fn(), onError };
    const instance = wrapped(cb);

    // Sem Web Speech API no jsdom → fallback dispara onError
    await instance.start(emptyStream());
    // Primary não deve ter sido chamado
    expect(started).toHaveLength(0);
    // O fallback tenta Web Speech; como não existe no jsdom, chama onError
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('Web Speech'));
  });

  it('cai no fallback quando primary.start() joga erro', async () => {
    const wrapped = withWebSpeechFallback(makeFailFactory());
    const onError = vi.fn();
    const cb: CloudASRCallbacks = { onTranscript: vi.fn(), onError };
    const instance = wrapped(cb);

    await instance.start(streamWithTrack());
    // Fallback Web Speech não existe em jsdom → onError avisando falta de suporte
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('Web Speech'));
  });

  it('stop() delega para o provider ativo (primary)', async () => {
    const stopSpy = vi.fn();
    const factory: ASRFactory = (_cb) => ({
      async start() {},
      stop: stopSpy,
    });
    const wrapped = withWebSpeechFallback(factory);
    const instance = wrapped({ onTranscript: vi.fn(), onError: vi.fn() });
    await instance.start(streamWithTrack());
    instance.stop();
    expect(stopSpy).toHaveBeenCalledOnce();
  });
});
