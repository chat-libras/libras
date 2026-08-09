import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Caminho absoluto para o banco SQLite. Arquivo fica em server/config/db.sqlite */
export const DB_PATH = path.resolve(__dirname, '../../config/db.sqlite');
