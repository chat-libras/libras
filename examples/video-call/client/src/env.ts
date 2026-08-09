export interface ClientEnv {
  serverUrl: string;
  debugMode: boolean;
}

export function getClientEnv(): ClientEnv {
  const serverUrl = import.meta.env['VITE_SERVER_URL'];
  if (!serverUrl) {
    throw new Error('VITE_SERVER_URL não definida. Copie .env.example para .env');
  }
  return {
    serverUrl,
    debugMode: import.meta.env['VITE_DEBUG_MODE'] === 'true',
  };
}
