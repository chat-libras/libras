import { Router } from 'express';
import {
  getParticipant,
  getParticipantsByRoom,
} from '../modules/participant/participant.service.ts';
import { getEventsByParticipant } from '../modules/participant-event/participant-event.service.ts';

export const participantsRouter = Router();

/** GET /participants/:id */
participantsRouter.get('/:id', async (req, res) => {
  const p = await getParticipant(req.params['id']!);
  if (!p) return res.status(404).json({ error: 'Participante não encontrado' });
  res.json(p);
});

/** GET /participants/:id/events */
participantsRouter.get('/:id/events', async (req, res) => {
  const events = await getEventsByParticipant(req.params['id']!);
  res.json(events);
});

/** GET /participants?roomId=xxx */
participantsRouter.get('/', async (req, res) => {
  const roomId = req.query['roomId'] as string | undefined;
  if (!roomId) return res.status(400).json({ error: '"roomId" é obrigatório' });
  const participants = await getParticipantsByRoom(roomId);
  res.json(participants);
});
