import type { HttpRequest } from "../models/http-request";
import { HttpResponse } from "../models/http-response";
import type { RouteHandler } from "../models/route-handler";
import { readFileSync } from 'fs';

export class FilesGetRouteHandler implements RouteHandler {
  private directoryPath: string;
  constructor(directoryPath: string) {
    this.directoryPath = directoryPath;
  }
  
  canHandle(pathSegments: string[], httpVerb: string): boolean {
    return pathSegments[0] === 'files' && pathSegments.length > 1 && httpVerb === 'GET';
  }

  handle(httpRequest: HttpRequest): HttpResponse {
    let fileName = httpRequest.getPathSegments()[1];  
    const filePath = `${this.directoryPath}${fileName}`;
    try {
      const fileContent = readFileSync(filePath);

      return HttpResponse
        .ok()
        .setHeader('Content-Type', 'application/octet-stream')
        .setHeader('Content-Length', String(fileContent.length))
        .setBody(fileContent);
    } catch (error) {
      return HttpResponse.notFound();
    }
  }
}