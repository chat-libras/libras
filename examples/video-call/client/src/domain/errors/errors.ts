export class UnexpectedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Algo inesperado aconteceu. Tente novamente.');
    this.name = 'UnexpectedError';
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Recurso não encontrado.');
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message ?? 'Requisição inválida.');
    this.name = 'BadRequestError';
  }
}

export class NetworkError extends Error {
  constructor(message?: string) {
    super(message ?? 'Erro de rede. Verifique sua conexão.');
    this.name = 'NetworkError';
  }
}
