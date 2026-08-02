import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DB_PATH } from '../config/db.ts';
import { Session } from './entities/Session.ts';
import { LogEvent } from './entities/LogEvent.ts';
import { Participant } from './entities/Participant.ts';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: DB_PATH,
  synchronize: true,
  logging: false,
  entities: [Session, LogEvent, Participant],
});
