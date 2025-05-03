import { CompressionFactory } from "../compression/compression-factory";

export class HttpResponse {
  statusCode: number;
  reasonPhrase?: string;
  httpVersion: string;
  headers: Record<string, string>;
  body?: string | Buffer;

  constructor(
    statusCode: number,
    httpVersion: string,
    reasonPhrase?: string,
    body?: string | Buffer,
  ) {
    this.statusCode = statusCode;
    this.httpVersion = httpVersion;
    this.headers = {};
    this.body = body;
    this.reasonPhrase = reasonPhrase;
  }
  
  setHeader(name: string, value: string): HttpResponse {
    this.headers[name] = value;
    return this;
  }
  
  setBody(body: string | Buffer): HttpResponse {
    if (!this.headers['Content-Length']) {
      const length = Buffer.isBuffer(body) ? body.length : Buffer.from(body).length;
      this.headers['Content-Length'] = length.toString();
    }

    this.body = body;
    return this;
  }

  applyCompression(acceptEncoding: string | undefined): HttpResponse {
    if (!acceptEncoding|| !this.body){
      return this;
    }

    const encodings = acceptEncoding.split(',');
    const strategy = CompressionFactory.getStrategy(encodings);

    if(strategy){
      const bodyBuffer = Buffer.isBuffer(this.body) ? this.body : Buffer.from(this.body);
      const compressedBody = strategy.compress(bodyBuffer);
      this.body = compressedBody;
      
      this.setHeader('Content-Encoding', strategy.getEncodingName());
      this.setHeader('Content-Type', 'text/plain');
      this.setHeader('Content-Length', String(compressedBody.length));
    }
    return this;
  }

  toBuffer(): Buffer {
    const statusLine = `${this.httpVersion} ${this.statusCode} ${this.reasonPhrase}\r\n`;
    const headers = 
      Object.entries(this.headers).map(([key, value]) => `${key}: ${value}`)
      .join('\r\n')
      .concat('\r\n')

    let bodyBuffer = Buffer.from('');
    if(this.body){
      const blankLine = '\r\n';
      const response = Buffer.isBuffer(this.body) ? this.body : Buffer.from(this.body || '');
      bodyBuffer = Buffer.concat([Buffer.from(blankLine), response]);
    }

    const result = Buffer.concat([Buffer.from(statusLine), Buffer.from(headers), bodyBuffer]);
    return result;
  }

  static ok(): HttpResponse {
    return new HttpResponse(200, "HTTP/1.1", "OK");
  }

  static created(): HttpResponse {
    return new HttpResponse(201, "HTTP/1.1", "Created");
  }

  static notFound(): HttpResponse {
    return new HttpResponse(404, "HTTP/1.1", "Not Found");
  }
}