import type { HttpRequest } from "../models/http-request";
import { HttpResponse } from "../models/http-response";
import type { RouteHandler } from "../models/route-handler";

export class EchoGetRouteHandler implements RouteHandler {
  canHandle(pathSegments: string[], httpVerb: string): boolean {
    return pathSegments[0] === 'echo' && pathSegments.length > 1 && httpVerb === 'GET';
  }

  handle(httpRequest: HttpRequest): HttpResponse {
    const pathSegments = httpRequest.getPathSegments();
    const text = pathSegments[1];

    return HttpResponse
      .ok()
      .setHeader('Content-Type', 'text/plain')
      .setHeader('Content-Length', String(text.length))
      .setBody(text);
  }
}