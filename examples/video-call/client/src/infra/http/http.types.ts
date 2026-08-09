export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpRequest {
  url: string;
  method: HttpMethod;
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
}

export interface IHttpClient {
  request<T>(req: HttpRequest): Promise<HttpResponse<T>>;
}
