export class HttpRequest {
  method: string;
  path: string;
  httpVersion: string;
  headers: Record<string, string>;
  body: string;
  pathParams: Record<string, string> = {};

  constructor(
    method: string,
    path: string,
    httpVersion: string,
    headers: Record<string, string>,
    body: string,
  ) {
    this.method = method;
    this.path = path;
    this.httpVersion = httpVersion;
    this.headers = headers;
    this.body = body;
  }

  getPathSegments(): string[] {
    return this.path.split('/').filter(segment => segment !== '');
  }
}