import { HttpRequest } from "../models/http-request";

export class HttpRequestParser {
  parse(rawRequest: string): HttpRequest {
    const [requestLine, ...rest] = rawRequest.split('\r\n');
    const { headers, body } = this.parseHeadersAndBody(rest);
    
    const [method, path, httpVersion] = requestLine.split(' ').filter(c => c !== '');
    
    return new HttpRequest(
      method,
      path,
      httpVersion,
      headers,
      body,
    )
  }

  private parseHeadersAndBody(elements: string[]): { headers: Record<string, string>, body: string } {
    const headers: Record<string, string> = {};
    let bodyStart = 0;
    
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] === '') {
        bodyStart = i + 1;
        break;
      }
      
      const [headerField, headerValue] = elements[i].split(':');
      if (headerField && headerValue) {
        headers[headerField.toLowerCase().trim()] = headerValue.trim();
      }
    }
    
    const body = elements[bodyStart] || '';
    
    return { headers, body };
  }
}