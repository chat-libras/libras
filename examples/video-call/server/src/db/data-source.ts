import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DB_PATH } from '../config/db.ts';
import { LogEvent } from './entities/LogEvent.ts';
import { Room } from '../modules/room/room.entity.ts';
import { CallLink } from '../modules/call-link/call-link.entity.ts';
import { Participant } from '../modules/participant/participant.entity.ts';
import { ParticipantEvent } from '../modules/participant-event/participant-event.entity.ts';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: DB_PATH,
  synchronize: true,
  logging: false,
  entities: [Room, CallLink, Participant, ParticipantEvent, LogEvent],
});
