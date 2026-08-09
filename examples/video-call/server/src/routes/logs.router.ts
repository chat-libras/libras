import { Router } from 'express';
import { getLogEvents } from '../db/log-service.ts';
import { getEventsByRoom } from '../modules/participant-event/participant-event.service.ts';

export const logsRouter = Router();

/**
 * GET /logs/rooms/:roomId — eventos de debug da sala (DebugPanel)
 * Query param: since (timestamp ms)
 */
logsRouter.get('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params as { roomId: string };
  const since = req.query['since'] ? Number(req.query['since']) : undefined;
  const logs = await getLogEvents(roomId, since);
  res.json(logs);
});

/**
 * GET /logs/rooms/:roomId/events — histórico de entrada/saída de participantes
 */
logsRouter.get('/rooms/:roomId/events', async (req, res) => {
  const { roomId } = req.params as { roomId: string };
  const events = await getEventsByRoom(roomId);
  res.json(events);
});
