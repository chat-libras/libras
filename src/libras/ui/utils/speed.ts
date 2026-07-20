// Ciclo de velocidade do avatar (mesma regra do <LibrasTranslator>): sobe em
// passos de 0,25× até o máximo e então volta ao início. Puro e testável.
export const SPEED_STEP = 0.25;
export const SPEED_MIN = 1;
export const SPEED_MAX = 2;

export const nextSpeedValue = (current: number): number =>
  current >= SPEED_MAX ? SPEED_MIN : Math.round((current + SPEED_STEP) * 100) / 100;
