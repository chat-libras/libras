# Exemplos

Dois projetos executáveis que mostram a `libras-translator` em ação:

| Pasta | Projeto | Para quê |
|-------|---------|----------|
| [`demo/`](./demo/README.md) | Demo (raiz do repo) | Testar a lib em memória, sem backend |
| [`video-call/`](./video-call/README.md) | Video-call harness | Videochamada WebRTC real com server + client |

## Início rápido

```bash
# Demo — roda na raiz do repo
npm install && npm run dev       # → http://localhost:5173

# Video-call — instalar e rodar os dois serviços
cd video-call/server && yarn install && cd ../client && yarn install && cd ../..
yarn vc                          # → server :3001 | client :5174
```

> Ambos exigem **Chrome** para microfone (Web Speech API).
> O video-call exige **Node ≥ 22** (`nvm install 22`).
