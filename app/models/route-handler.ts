import type { HttpResponse } from "./http-response";

export interface RouteHandler {
  canHandle(pathSegments: string[], httpVerb: string): boolean;
  handle(httpRequest: any): HttpResponse;
}