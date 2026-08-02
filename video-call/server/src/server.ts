import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { getServerEnv } from './env.ts';
import { handleWsConnection } from './signaling/index.ts';
import { getOrCreateRoom, getRoomInfo } from './rooms.ts';
import { AppDataSource } from './db/data-source.ts';
import { DB_PATH } from './config/db.ts';
import {
  createParticipant,
  getParticipant,
  getParticipantsByRoom,
} from './db/participant-service.ts';
import { getOrCreateSession, getLogEvents } from './db/log-service.ts';

const env = getServerEnv();
const app = express();

app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  next();
});

// ── Rooms ───────────────────────────────────────────────────────────────────

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

// ── Participants ─────────────────────────────────────────────────────────────

/** POST /rooms/:roomId/participants — cria participante e gera URL de acesso */
app.post('/rooms/:roomId/participants', async (req, res) => {
  const { roomId } = req.params as { roomId: string };
  const { role } = req.body as { role?: string };
  if (!role) return res.status(400).json({ error: '"role" é obrigatório' });

  const room = getOrCreateRoom(roomId);
  const id = randomUUID();
  const accessUrl = `${req.protocol}://${req.get('host')}/sala/${room.id}/${role}?pid=${id}`;
  const session = await getOrCreateSession(room.id);
  const participant = await createParticipant({ id, roomId: room.id, role, accessUrl, sessionId: session.id });
  res.status(201).json(participant);
});

app.get('/rooms/:roomId/participants', async (req, res) => {
  const participants = await getParticipantsByRoom(req.params['roomId'] as string);
  res.json(participants);
});

app.get('/participants/:id', async (req, res) => {
  const p = await getParticipant(req.params['id'] as string);
  if (!p) return res.status(404).json({ error: 'Participante não encontrado' });
  res.json(p);
});

// ── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Logs ─────────────────────────────────────────────────────────────────────

app.get('/rooms/:roomId/logs', async (req, res) => {
  const { roomId } = req.params as { roomId: string };
  const since = req.query['since'] ? Number(req.query['since']) : undefined;
  const logs = await getLogEvents(roomId, since);
  res.json(logs);
});

// ── Bootstrap ────────────────────────────────────────────────────────────────

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
