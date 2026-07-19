import { useEffect, useState } from "react";
import { useLibrasTranslator } from "../libras";
import { StatusHeader } from "./components/StatusHeader/StatusHeader";
import { LibrasAvatar } from "./components/LibrasAvatar/LibrasAvatar";
import { DoctorVideo } from "./components/DoctorVideo/DoctorVideo";
import { MicButton } from "./components/MicButton/MicButton";
import { SpeedButton } from "./components/SpeedButton/SpeedButton";
import { ManualForm } from "./components/ManualForm/ManualForm";
import { DemoNote } from "./components/DemoNote/DemoNote";
import "./styles.css";

// ---------------------------------------------------------------------------
// Demo de TELEMEDICINA usando o plugin libras-translator.
//
// Simula uma chamada de vídeo: o "médico" fala no microfone e o avatar do
// VLibras traduz para Libras para o paciente surdo, em tempo real.
//
// No mundo real, em vez do microfone você passaria a faixa de áudio remota do
// WebRTC:  audio={{ kind: 'stream', stream: remoteAudioStream }}
// com asr={{ provider: 'deepgram', apiKey }}.
// ---------------------------------------------------------------------------

export function App() {
  // Legenda única, compartilhada entre a fala (áudio) e o texto digitado.
  // Alterna entre as duas fontes: a última entrada vence.
  const [caption, setCaption] = useState("");

  // Traduz o microfone (Web Speech, grátis) — simula a fala do médico.
  const libras = useLibrasTranslator({
    audio: { kind: "microphone" },
    asr: { provider: "webspeech", lang: "pt-BR" },
    autoStart: false,
    speed: 1.3,
    // Frase final reconhecida do áudio → vira legenda.
    onTranscript: (t) => setCaption(t),
  });

  // Transcrição parcial (ao vivo) do áudio → atualiza a legenda enquanto fala.
  useEffect(() => {
    if (libras.interim) setCaption(libras.interim);
  }, [libras.interim]);

  // Texto digitado no input → traduz E aparece na mesma legenda.
  const handleManualTranslate = (text: string) => {
    libras.translate(text);
    setCaption(text);
  };

  return (
    <div className="tm">
      <StatusHeader status={libras.status} listening={libras.listening} />

      <main className="tm__main">
        {/* Vídeo do médico (80%) à esquerda; à direita, avatar em cima e controles embaixo */}
        <section className="tm__call">
          <DoctorVideo caption={caption} listening={libras.listening} />
        </section>
        <div className="tm__side">
          <LibrasAvatar
            containerRef={libras.containerRef}
            status={libras.status}
            error={libras.error}
          />
          <footer className="tm__controls">
            <ManualForm
              status={libras.status}
              onTranslate={handleManualTranslate}
            />
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: "12px" }}>
            <MicButton
              status={libras.status}
              listening={libras.listening}
              onStart={libras.start}
              onStop={libras.stop}
            />
            <SpeedButton
              status={libras.status}
              speed={libras.speed}
              onSetSpeed={libras.setSpeed}
            />
            </div>
          </footer>
        </div>
      </main>

      <DemoNote />
    </div>
  );
}
