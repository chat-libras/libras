import { Router } from 'express';
import { createRoom, findRoomById, listRooms, closeRoom } from '../modules/room/room.service.ts';

export const roomsRouter = Router();

/** POST /rooms — cria uma nova sala */
roomsRouter.post('/', async (_req, res) => {
  const room = await createRoom();
  res.status(201).json(room);
});

/** GET /rooms — lista todas as salas */
roomsRouter.get('/', async (_req, res) => {
  const rooms = await listRooms();
  res.json(rooms);
});

/** GET /rooms/:id */
roomsRouter.get('/:id', async (req, res) => {
  const room = await findRoomById(req.params['id']!);
  if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
  res.json(room);
});

/** DELETE /rooms/:id — fecha uma sala */
roomsRouter.delete('/:id', async (req, res) => {
  const room = await findRoomById(req.params['id']!);
  if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
  await closeRoom(req.params['id']!);
  res.status(204).send();
});
