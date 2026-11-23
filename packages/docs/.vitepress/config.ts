import { defineConfig } from 'vitepress';

// Escapa {{ }} em inline code (` `) para não conflitar com Vue template syntax.
// Triple-backtick code fences já são escapados pelo VitePress automaticamente.
function escapeVueInterpolationsInInlineCode(md: ReturnType<typeof import('markdown-it')['default']>) {
  const original = md.renderer.rules['code_inline']!;
  md.renderer.rules['code_inline'] = (tokens, idx, options, env, self) => {
    tokens[idx].content = tokens[idx].content
      .replace(/\{\{/g, '&#123;&#123;')
      .replace(/\}\}/g, '&#125;&#125;');
    return original(tokens, idx, options, env, self);
  };
}

export default defineConfig({
  srcDir: '../../docs',
  srcExclude: ['**/internal/**', '**/specs/**'],
  title: 'libras-kit',
  markdown: { config: escapeVueInterpolationsInInlineCode },
  description: 'Plugin React para tradução simultânea Português → Libras com avatar VLibras',
  lang: 'pt-BR',

  themeConfig: {
    nav: [
      { text: 'Guias', link: '/guides/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Arquitetura', link: '/architecture' },
      {
        text: 'GitHub',
        link: 'https://github.com/chat-libras/libras',
      },
    ],

    sidebar: [
      {
        text: 'Introdução',
        items: [
          { text: 'Começando', link: '/guides/getting-started' },
        ],
      },
      {
        text: 'Guias',
        items: [
          { text: 'Configurar ASR', link: '/guides/asr' },
          { text: 'Adapters de videochamada', link: '/guides/video-call-adapters' },
          { text: 'Customização', link: '/guides/customization' },
        ],
      },
      {
        text: 'Referência',
        items: [
          { text: 'API completa', link: '/api' },
          { text: 'Arquitetura', link: '/architecture' },
          { text: 'Setup do VLibras', link: '/vlibras-setup' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chat-libras/libras' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'Licença MIT · VLibras é LGPLv3 (gov.br/MECDAISY/Serpro)',
    },
  },
});
