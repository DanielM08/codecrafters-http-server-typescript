import type { HttpRequest } from "../models/http-request";
import { HttpResponse } from "../models/http-response";
import type { RouteHandler } from "../models/route-handler";

export class RootRouteRouteHandler implements RouteHandler {
  canHandle(pathSegments: string[], _: string): boolean {
    return pathSegments.length === 0;
  }

  handle(_: HttpRequest): HttpResponse {
    return HttpResponse.ok();
  }
}