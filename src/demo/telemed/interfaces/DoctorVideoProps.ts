// Props do vídeo do médico, incluindo a legenda (áudio ou texto digitado).
export interface DoctorVideoProps {
  /** Legenda a exibir sobre o vídeo. */
  caption: string;
  /** Se está ouvindo o microfone (mostra "Ouvindo…" quando sem legenda). */
  listening: boolean;
}
