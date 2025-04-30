import * as net from "net";
import { readFileSync, writeFileSync } from 'fs';
import zlib from "zlib";

type Header = Record<string, string>;

function parseHeadersAndRequestBody(elements: string[]){
  let requestBody;
  let headers: Header = {};
  for(let i = 0; i < elements.length; i++){
    if(elements[i] === ''){
      break;
    }
    const [headerField, headerValue] = elements[i].split(':');
    headers[headerField.toLowerCase().trim()] = headerValue.trim();
  }
  requestBody = elements[elements.length - 1];

  return {
    headers,
    requestBody,
  }
}

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', async (request) => {
    const [requestLine, ...rest] = request.toString().split('\r\n'); 
    const { headers, requestBody } = parseHeadersAndRequestBody(rest);

    const [httpVerb, rawPath, httpVersion] = requestLine.split(' ').filter(c => c !== '');
    const path = rawPath.split('/').filter(c => c !== '');

    let responseStatus = '';
    let rawResponseHeaders: Record<string, string> = {};
    let rawResponseBody: string | undefined | Buffer = undefined;

    if(path[0] === 'echo'){
      const text = path[1];
      responseStatus = 'HTTP/1.1 200 OK';
      rawResponseHeaders['Content-Type'] = 'text/plain';
      rawResponseHeaders['Content-Length'] = String(text.length);
      rawResponseBody = text;
    }
    else if(path[0] === 'user-agent'){
      let body = headers['user-agent'] || '';
      responseStatus = 'HTTP/1.1 200 OK';
      rawResponseHeaders['Content-Type'] = 'text/plain';
      rawResponseHeaders['Content-Length'] = String(body.length);
      rawResponseBody = body;
    }
    else if(path[0] === 'files'){
      let fileName = path[1];

      const args = process.argv.slice(2);
      const absPath = args[args.length - 1];
      const filePath = `${absPath}${fileName}`;

      if(httpVerb === 'GET'){
        try {
          const fileContent = readFileSync(filePath);
          responseStatus = 'HTTP/1.1 200 OK';
          rawResponseHeaders['Content-Type'] = 'application/octet-stream';
          rawResponseHeaders['Content-Length'] = String(fileContent.length);
          rawResponseBody = fileContent.toString();
        } catch (error) {
          responseStatus = 'HTTP/1.1 404 Not Found';
        }
      }
      else if(httpVerb === 'POST'){
        try {
          writeFileSync(filePath, requestBody);
          responseStatus = 'HTTP/1.1 201 Created';
        } catch (error) {
          responseStatus = 'HTTP/1.1 404 Not Found';
        }
      } else {
        responseStatus = 'HTTP/1.1 404 Not Found';
      }
    }
    else if(path.length === 0){
      responseStatus = 'HTTP/1.1 200 OK';
    }
    else{
      responseStatus = 'HTTP/1.1 404 Not Found';
    }

    console.log(`Req headers: ${headers}`);
    if(headers['connection']){
      rawResponseHeaders['Connection'] = `${headers['connection']}`;
    }

    const acceptEncodingHeader = headers['accept-encoding'];
    if(acceptEncodingHeader){
      const encodings = acceptEncodingHeader.split(',');
      for (const encoding of encodings){
        if(encoding.trim() === 'gzip'){

          if(rawResponseBody){
            rawResponseBody = zlib.gzipSync(Buffer.from(rawResponseBody));

            rawResponseHeaders['Content-Encoding'] = 'gzip';
            rawResponseHeaders['Content-Type'] = 'text/plain';
            rawResponseHeaders['Content-Length'] = String(rawResponseBody.length);
            break;
          }
        }
      }
    }

    let responseHeaders = 
      Object.keys(rawResponseHeaders).reduce((prev, key) => {
        prev += `${key}: ${rawResponseHeaders[key]}\r\n`;
        return prev;
      }, '\r\n')

    console.log(responseStatus);
    console.log(responseHeaders);
    console.log(rawResponseBody);

    let response;
    if(rawResponseHeaders['Content-Encoding'] === 'gzip' && rawResponseBody && rawResponseBody instanceof Buffer){
      responseHeaders += '\r\n'

      response = Buffer.concat([Buffer.from(responseStatus), Buffer.from(responseHeaders), rawResponseBody]);
    }else {
      response = `${responseStatus}${responseHeaders}\r\n${rawResponseBody}`
    }    

    socket.write(response);
    if(headers['connection'] === 'close'){
      socket.end();
    }
  })
});

server.listen(4221, "localhost");
