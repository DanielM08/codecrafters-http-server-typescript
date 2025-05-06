import { HttpResponse } from "../models/http-response";
import type { RouteHandler } from "../models/route-handler";

export class Router {
  private handlers: RouteHandler[] = [];

  addHandler(handler: RouteHandler): Router {
    this.handlers.push(handler);
    return this;
  }

  route(httpRequest: any): HttpResponse {
    const pathSegments = httpRequest.getPathSegments();
    const { method: httpVerb } = httpRequest;

    for (const handler of this.handlers) {
      if (handler.canHandle(pathSegments, httpVerb)) {
        return handler.handle(httpRequest);
      }
    }

    return HttpResponse.notFound();
  }
}