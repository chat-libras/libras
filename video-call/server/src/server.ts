import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { getServerEnv } from './env.ts';
import { handleWsConnection } from './signaling/index.ts';
import { getOrCreateRoom, getRoomInfo } from './rooms.ts';
import { AppDataSource } from './db/data-source.ts';

const env = getServerEnv();
const app = express();

app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.post('/rooms', (_req, res) => {
  const roomId = randomUUID();
  getOrCreateRoom(roomId);
  res.json({ roomId });
});

app.get('/rooms/:roomId', (req, res) => {
  const room = getRoomInfo(req.params['roomId'] as string);
  if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
  res.json({ roomId: room.id, peerCount: room.peers.size, createdAt: room.createdAt });
});

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

const server = createServer(app);
const wss = new WebSocketServer({ server, path: env.wsPath });

wss.on('connection', (ws) => handleWsConnection(ws));

AppDataSource.initialize()
  .then(() => {
    console.log('[db] SQLite inicializado');
    server.listen(env.port, () => {
      console.log(`[server] HTTP: http://localhost:${env.port}`);
      console.log(`[server] WS:   ws://localhost:${env.port}${env.wsPath}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[db] Falha ao inicializar banco:', err);
    process.exit(1);
  });
