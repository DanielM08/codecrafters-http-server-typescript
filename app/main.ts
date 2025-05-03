import * as net from "net";
import { readFileSync, writeFileSync } from 'fs';
import { HttpRequestParser } from "./parsers/http-request-parser";
import { HttpResponse } from "./models/http-response";

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', async (request) => {
    const requestParser = new HttpRequestParser();
    const httpRequest = requestParser.parse(request.toString());
    const { headers: requestHeaders, method: httpVerb, body: requestBody } = httpRequest;
    const pathSegments = httpRequest.getPathSegments();

    let httpResponse: HttpResponse | undefined = undefined;

    if(pathSegments[0] === 'echo'){
      const text = pathSegments[1];

      httpResponse = HttpResponse
        .ok()
        .setHeader('Content-Type', 'text/plain')
        .setHeader('Content-Length', String(text.length))
        .setBody(text);
    }
    else if(pathSegments[0] === 'user-agent'){
      let body = requestHeaders['user-agent'] || '';

      httpResponse = HttpResponse
        .ok()
        .setHeader('Content-Type', 'text/plain')
        .setHeader('Content-Length', String(body.length))
        .setBody(body);
    }
    else if(pathSegments[0] === 'files'){
      let fileName = pathSegments[1];

      const args = process.argv.slice(2);
      const absPath = args[args.length - 1];
      const filePath = `${absPath}${fileName}`;

      if(httpVerb === 'GET'){
        try {
          const fileContent = readFileSync(filePath);

          httpResponse = HttpResponse
            .ok()
            .setHeader('Content-Type', 'application/octet-stream')
            .setHeader('Content-Length', String(fileContent.length))
            .setBody(fileContent);
        } catch (error) {
          //
        }
      }
      else if(httpVerb === 'POST'){
        try {
          writeFileSync(filePath, requestBody);
          httpResponse = HttpResponse.created()
        } catch (error) {
          //
        }
      }
    }
    else if(pathSegments.length === 0){
      httpResponse = HttpResponse.ok();
    }

    if(!httpResponse){
      httpResponse = HttpResponse.notFound();
    }

    if(requestHeaders['connection']){
      httpResponse.setHeader('Connection', requestHeaders['connection']);
    }

    const response = httpResponse
      .applyCompression(requestHeaders['accept-encoding'])
      .toBuffer();

    socket.write(response);
    if(requestHeaders['connection'] === 'close'){
      socket.end();
    }
  })
});

server.listen(4221, "localhost");
