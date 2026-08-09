# video-call

Harness de teste para a lib `libras-translator`. **Não faz parte do bundle publicado.**

## Estrutura

```
video-call/
├── server/   ← Node.js + Express + WebSocket (sinalização WebRTC + chat)
└── client/   ← React + Vite (WebRTC mesh, chat, avatar Libras, debug panel)
```

## Setup

```bash
# Server
cd server && cp .env.example .env && yarn install && yarn dev

# Client (em outro terminal)
cd client && cp .env.example .env && yarn install && yarn dev
```

## Portas padrão

| Serviço | URL |
|---|---|
| Server HTTP | http://localhost:3001 |
| Server WS | ws://localhost:3001/ws |
| Client | http://localhost:5174 |

## Variáveis de ambiente

### server/.env

```env
PORT=3001
WS_PATH=/ws
```

### client/.env

```env
VITE_SERVER_URL=ws://localhost:3001/ws
```

## Participantes suportados

Qualquer número (mesh WebRTC). Roles disponíveis: `patient`, `professional`.
O avatar Libras é exibido apenas para o role `patient`.
