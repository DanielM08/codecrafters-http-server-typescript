import type { HttpRequest } from "../models/http-request";
import { HttpResponse } from "../models/http-response";
import type { RouteHandler } from "../models/route-handler";

export class UserAgentGetRouteHandler implements RouteHandler {
  canHandle(pathSegments: string[], httpVerb: string): boolean {
    return pathSegments[0] === 'user-agent' && httpVerb === 'GET';
  }

  handle(httpRequest: HttpRequest): HttpResponse {
    let body = httpRequest.headers['user-agent'] || '';

    return HttpResponse
        .ok()
        .setHeader('Content-Type', 'text/plain')
        .setHeader('Content-Length', String(body.length))
        .setBody(body);
  }
}