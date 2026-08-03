import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { getServerEnv } from './env.ts';
import { handleWsConnection } from './signaling/index.ts';
import { AppDataSource } from './db/data-source.ts';
import { DB_PATH } from './config/db.ts';
import { roomsRouter } from './routes/rooms.router.ts';
import { callLinksRouter } from './routes/call-links.router.ts';
import { participantsRouter } from './routes/participants.router.ts';
import { logsRouter } from './routes/logs.router.ts';

const env = getServerEnv();
const app = express();

app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  next();
});

// ── Routers ───────────────────────────────────────────────────────────────────
app.use('/rooms', roomsRouter);
app.use('/call-links', callLinksRouter);
app.use('/participants', participantsRouter);
app.use('/logs', logsRouter);
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const server = createServer(app);
const wss = new WebSocketServer({ server, path: env.wsPath });
wss.on('connection', (ws) => handleWsConnection(ws));

console.log(`[db] Conectando ao banco: ${DB_PATH}`);
AppDataSource.initialize()
  .then(() => {
    console.log('[db] ✅ Banco conectado e schema sincronizado');
    server.listen(env.port, () => {
      console.log(`[server] ✅ HTTP: http://localhost:${env.port}`);
      console.log(`[server] ✅ WS:   ws://localhost:${env.port}${env.wsPath}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[db] ❌ Falha ao conectar ao banco:', err);
    process.exit(1);
  });
