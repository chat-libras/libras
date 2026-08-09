import { httpClient } from '../infra/http/index.ts';
import { RoomGateway } from '../modules/room/index.ts';
import { CallLinkGateway } from '../modules/call-link/index.ts';
import { getClientEnv } from '../env.ts';

function getApiBaseUrl(): string {
  const { serverUrl } = getClientEnv();
  // serverUrl é ws://host/path ou wss://host/path — converte para HTTP
  const url = new URL(serverUrl);
  const protocol = url.protocol === 'wss:' ? 'https' : 'http';
  return `${protocol}://${url.host}`;
}

export function createRoomGateway(): RoomGateway {
  return new RoomGateway(httpClient, getApiBaseUrl());
}

export function createCallLinkGateway(): CallLinkGateway {
  return new CallLinkGateway(httpClient, getApiBaseUrl());
}
