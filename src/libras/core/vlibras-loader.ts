import type { VLibrasPlayerLike } from './vlibras-renderer';

// ---------------------------------------------------------------------------
// Carregador do player oficial do VLibras (avatar Ícaro, Unity/WebGL).
//
// O VLibras NÃO é um pacote npm ESM limpo: é um bundle que expõe
// `window.VLibras.Player`, carregado via <script>, e que baixa os assets Unity
// de `targetPath` (UnityLoader.js + playerweb.json + Build/). Ver docs/vlibras-setup.md.
//
// A API real (confirmada em spbgovbr-vlibras/vlibras-player-webjs):
//   const player = new window.VLibras.Player({ targetPath })
//   player.load(container)            → monta o avatar Unity
//   player.translate(texto)           → sinaliza
//   player.on('load' | 'animation:end' | ...)   → eventos
//   player.setSpeed(n) / stop() / changeAvatar(nome)
// ---------------------------------------------------------------------------

// CDN oficial (jsDelivr) com os assets Unity. Responde 200 + CORS `*`, então
// dispensa hospedar os ~13 MB de `target/` localmente. Os arquivos locais em
// public/vlibras/target/ continuam servindo como fallback offline (basta passar
// targetPath: '/vlibras/target' nas opções). Ver docs/vlibras-setup.md.
//
// Fixado no commit SHA da branch `sgd` (não em `@sgd`) para evitar que uma
// mudança na branch quebre os assets. Para atualizar: pegue o novo SHA em
// https://github.com/spbgovbr-vlibras/vlibras-portal e troque abaixo.
const DEFAULT_TARGET_PATH =
  'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@02c29088381b2c779bbbc5fde821d809f532c474/app/target';

interface VLibrasPlayerFull extends VLibrasPlayerLike {
  load(wrapper: HTMLElement): void;
  changeAvatar?(name: string): void;
}
interface VLibrasGlobal {
  Player: new (options: { targetPath: string; [key: string]: unknown }) => VLibrasPlayerFull;
}
declare global {
  interface Window {
    VLibras?: VLibrasGlobal;
  }
}

export interface VLibrasLoaderOptions {
  /** URL do bundle do player (define window.VLibras). */
  bundleUrl?: string;
  /** URL onde estão os assets Unity (UnityLoader.js, playerweb.json, Build/). */
  targetPath?: string;
  /** Avatar: 'icaro' | 'hozana' | 'guga'. */
  avatar?: string;
  /** Nome do evento de "carregado". */
  loadEvent?: string;
}

// Injeta o bundle do VLibras uma única vez e devolve window.VLibras.
async function ensureBundle(bundleUrl: string): Promise<VLibrasGlobal> {
  if (window.VLibras) return window.VLibras;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = bundleUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar o bundle do VLibras: ${bundleUrl}`));
    document.head.appendChild(script);
  });
  if (!window.VLibras) {
    throw new Error('Bundle do VLibras carregado, mas window.VLibras não foi definido.');
  }
  return window.VLibras;
}

// Singleton: o Unity/WebGL do VLibras é pesado e não deve ser criado mais de uma
// vez (o StrictMode do React monta 2× em dev, e trocar de aba remonta o
// componente). Criamos o player UMA vez e o reanexamos ao container atual.
let playerPromise: Promise<VLibrasPlayerFull> | null = null;
let loadedContainer: HTMLElement | null = null;

export async function createVLibrasPlayer(
  container: HTMLElement,
  opts: VLibrasLoaderOptions = {}
): Promise<VLibrasPlayerLike> {
  if (playerPromise) {
    const player = await playerPromise;
    // Move o canvas Unity já existente para o container atual (troca de aba).
    if (loadedContainer && loadedContainer !== container) {
      while (loadedContainer.firstChild) container.appendChild(loadedContainer.firstChild);
    }
    loadedContainer = container;
    return player;
  }

  loadedContainer = container;
  playerPromise = (async () => {
    const VLibras = await ensureBundle(opts.bundleUrl ?? '/vlibras/vlibras.js');
    const player = new VLibras.Player({ targetPath: opts.targetPath ?? DEFAULT_TARGET_PATH });
    player.load(container);
    await new Promise<void>((resolve) => player.on(opts.loadEvent ?? 'load', () => resolve()));
    if (opts.avatar && player.changeAvatar) player.changeAvatar(opts.avatar);
    return player;
  })();

  return playerPromise;
}
