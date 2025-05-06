import type { HttpRequest } from "../models/http-request";
import { HttpResponse } from "../models/http-response";
import type { RouteHandler } from "../models/route-handler";
import { writeFileSync } from 'fs';

export class FilesPostRouteHandler implements RouteHandler {
  private directoryPath: string;
  constructor(directoryPath: string) {
    this.directoryPath = directoryPath;
  }

  canHandle(pathSegments: string[], httpVerb: string): boolean {
    return pathSegments[0] === 'files' && pathSegments.length > 1 && httpVerb === 'POST';
  }

  handle(httpRequest: HttpRequest): HttpResponse {
    const { body: requestBody } = httpRequest;
    let fileName = httpRequest.getPathSegments()[1];
    const filePath = `${this.directoryPath}${fileName}`;

    try {
      writeFileSync(filePath, requestBody);
      
      return HttpResponse.created()
    } catch (error) {
      return HttpResponse.notFound();
    }
  }
}