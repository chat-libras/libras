import type { IHttpClient } from '../../infra/http/index.ts';
import type { CallLinkModel, CreateCallLinkInput } from './call-link.model.ts';
import { BadRequestError, NotFoundError, UnexpectedError } from '../../domain/errors/index.ts';

export class CallLinkGateway {
  constructor(private readonly http: IHttpClient, private readonly baseUrl: string) {}

  async create(input: CreateCallLinkInput): Promise<CallLinkModel> {
    const res = await this.http.request<CallLinkModel>({
      url: `${this.baseUrl}/call-links`,
      method: 'POST',
      data: input,
    });
    if (res.status === 400) throw new BadRequestError((res.data as { error?: string })?.error);
    if (res.status === 404) throw new NotFoundError('Sala não encontrada');
    if (res.status === 409) throw new BadRequestError('Sala já encerrada');
    if (!res.ok) throw new UnexpectedError();
    return res.data;
  }

  async findById(id: string): Promise<CallLinkModel> {
    const res = await this.http.request<CallLinkModel>({
      url: `${this.baseUrl}/call-links/${id}`,
      method: 'GET',
    });
    if (res.status === 404) throw new NotFoundError('Link não encontrado');
    if (!res.ok) throw new UnexpectedError();
    return res.data;
  }

  async findByRoom(roomId: string): Promise<CallLinkModel[]> {
    const res = await this.http.request<CallLinkModel[]>({
      url: `${this.baseUrl}/call-links`,
      method: 'GET',
      params: { roomId },
    });
    if (!res.ok) throw new UnexpectedError();
    return res.data;
  }
}
