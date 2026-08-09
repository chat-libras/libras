import axios, { type AxiosError } from 'axios';
import type { HttpRequest, HttpResponse, IHttpClient } from './http.types.ts';
import { NetworkError, UnexpectedError } from '../../domain/errors/index.ts';

class HttpClient implements IHttpClient {
  private static instance: HttpClient | null = null;

  static getInstance(): HttpClient {
    if (!this.instance) this.instance = new HttpClient();
    return this.instance;
  }

  async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
    try {
      const res = await axios.request<T>({
        method: req.method,
        url: req.url,
        data: req.data,
        params: req.params,
        headers: { 'Content-Type': 'application/json' },
      });
      return { data: res.data, status: res.status, ok: true };
    } catch (err) {
      const axiosErr = err as AxiosError<T>;
      if (axiosErr.response) {
        return { data: axiosErr.response.data as T, status: axiosErr.response.status, ok: false };
      }
      if (axiosErr.request) throw new NetworkError();
      throw new UnexpectedError();
    }
  }
}

export const httpClient: IHttpClient = HttpClient.getInstance();
