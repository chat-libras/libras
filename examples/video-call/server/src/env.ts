export interface ServerEnv {
  port: number;
  wsPath: string;
}

export function getServerEnv(): ServerEnv {
  const port = parseInt(process.env['PORT'] ?? '3001', 10);
  if (isNaN(port)) throw new Error('Env PORT inválida');
  return {
    port,
    wsPath: process.env['WS_PATH'] ?? '/ws',
  };
}
