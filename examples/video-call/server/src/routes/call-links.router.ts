import { Router } from 'express';
import {
  createCallLink,
  findCallLinkById,
  findCallLinksByRoom,
  CreateCallLinkSchema,
} from '../modules/call-link/call-link.service.ts';
import { findRoomById } from '../modules/room/room.service.ts';

export const callLinksRouter = Router();

function getBaseUrl(req: import('express').Request): string {
  return `${req.protocol}://${req.get('host')}`;
}

/**
 * POST /call-links
 * Body: { roomId, name, role, document?, expiresAt? }
 * Cria um link de acesso para um participante ingressar na sala.
 */
callLinksRouter.post('/', async (req, res) => {
  const parsed = CreateCallLinkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.issues });
  }

  const room = await findRoomById(parsed.data.roomId);
  if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
  if (room.closedAt) return res.status(409).json({ error: 'Sala já encerrada' });

  const link = await createCallLink(parsed.data, getBaseUrl(req));
  res.status(201).json(link);
});

/** GET /call-links/:id */
callLinksRouter.get('/:id', async (req, res) => {
  const link = await findCallLinkById(req.params['id']!);
  if (!link) return res.status(404).json({ error: 'Link não encontrado' });
  res.json(link);
});

/** GET /call-links?roomId=xxx — lista links de uma sala */
callLinksRouter.get('/', async (req, res) => {
  const roomId = req.query['roomId'] as string | undefined;
  if (!roomId) return res.status(400).json({ error: '"roomId" é obrigatório' });
  const links = await findCallLinksByRoom(roomId);
  res.json(links);
});
