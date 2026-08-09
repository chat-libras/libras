import type { IHttpClient } from '../../infra/http/index.ts';
import type { RoomModel } from './room.model.ts';
import { NotFoundError, UnexpectedError } from '../../domain/errors/index.ts';

export class RoomGateway {
  constructor(private readonly http: IHttpClient, private readonly baseUrl: string) {}

  async create(): Promise<RoomModel> {
    const res = await this.http.request<RoomModel>({
      url: `${this.baseUrl}/rooms`,
      method: 'POST',
    });
    if (!res.ok) throw new UnexpectedError('Falha ao criar sala');
    return res.data;
  }

  async findById(id: string): Promise<RoomModel> {
    const res = await this.http.request<RoomModel>({
      url: `${this.baseUrl}/rooms/${id}`,
      method: 'GET',
    });
    if (res.status === 404) throw new NotFoundError('Sala não encontrada');
    if (!res.ok) throw new UnexpectedError();
    return res.data;
  }
}
