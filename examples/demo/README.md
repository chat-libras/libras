# Exemplo: Demo (`src/demo/`)

Simulação de teleconsulta com os dois lados (médico + cliente) na **mesma tela**, ligados por um canal em memória. Sem backend. Ideal para desenvolver e testar componentes da lib.

## Onde fica

O projeto vive na **raiz do repositório** (`/`). O `vite.config.ts` da raiz aponta para `src/demo/App.tsx` como entry point da demo.

```
/
├── index.html          ← entry HTML
├── src/
│   ├── demo/           ← código da demo
│   │   └── App.tsx
│   └── libras/         ← a biblioteca
├── package.json
└── vite.config.ts
```

## Requisitos

- Node.js (qualquer versão LTS)
- **Chrome** (Web Speech API para microfone)

## Como rodar

```bash
# na raiz do repo
npm install
npm run dev
# → http://localhost:5173
```

## O que testar

1. Clique em **🎤 Falar** no lado do médico → fale em pt-BR → o avatar sinaliza no lado do cliente
2. Ou escreva uma mensagem no chat do médico → mesmo efeito
3. Responda como cliente por texto → aparece no chat do médico

## Specs

| Item | Valor |
|------|-------|
| Porta | **5173** |
| Entry point | `index.html` → `src/main.tsx` → `src/demo/App.tsx` |
| Backend | nenhum — canal em memória |
| ASR | Web Speech API (microfone, grátis, Chrome/pt-BR) |
| Assets Unity | `public/vlibras/` (servidos pelo Vite) |

## Scripts disponíveis

| Comando | O quê |
|---------|-------|
| `npm run dev` | demo em modo dev |
| `npm run build` | build da lib (typecheck + bundle em `dist/`) |
| `npm test` | testes (Vitest) |
| `npm run typecheck` | checagem de tipos |
