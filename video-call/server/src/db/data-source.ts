import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Session } from './entities/Session.ts';
import { LogEvent } from './entities/LogEvent.ts';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: './debug.sqlite',
  synchronize: true, // auto-cria tabelas em dev
  logging: false,
  entities: [Session, LogEvent],
});
