import * as net from "net";
import { readFileSync, writeFileSync } from 'fs';

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

  socket.on('data', (request) => {
    const [requestLine, ...rest] = request.toString().split('\r\n'); 
    const { headers, requestBody } = parseHeadersAndRequestBody(rest);

    const [httpVerb, rawPath, httpVersion] = requestLine.split(' ').filter(c => c !== '');
    const path = rawPath.split('/').filter(c => c !== '');

    let responseStatus = '';
    let responseHeaders = '\r\n';
    let responseBody = '\r\n';

    if(path[0] === 'echo'){
      const text = path[1];
      responseStatus = 'HTTP/1.1 200 OK';
      responseHeaders = `\r\nContent-Type: text/plain\r\nContent-Length: ${text.length}\r\n`;
      responseBody = `\r\n${text}`;
    }
    else if(path[0] === 'user-agent'){
      let body = headers['user-agent'] || '';
      responseStatus = 'HTTP/1.1 200 OK';
      responseHeaders = `\r\nContent-Type: text/plain\r\nContent-Length:${body.length}\r\n`;
      responseBody = `\r\n${body}`;
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
          responseHeaders = `\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n`;
          responseBody = `\r\n${fileContent.toString()}`;

          socket.write(`${responseStatus}${responseHeaders}${responseBody}`);
        } catch (error) {
          responseStatus = 'HTTP/1.1 404 Not Found';
          responseHeaders = '\r\n';
          responseBody = '\r\n';
        }
      }
      else if(httpVerb === 'POST'){
        try {
          writeFileSync(filePath, requestBody);
          responseStatus = 'HTTP/1.1 201 Created';
          responseHeaders = '\r\n';
          responseBody = '\r\n';
        } catch (error) {
          responseStatus = 'HTTP/1.1 404 Not Found';
          responseHeaders = '\r\n';
          responseBody = '\r\n';
        }
      } else {
        responseStatus = 'HTTP/1.1 404 Not Found';
        responseHeaders = '\r\n';
        responseBody = '\r\n';
      }
    }
    else if(path.length === 0){
      responseStatus = 'HTTP/1.1 200 OK';
      responseHeaders = '\r\n';
      responseBody = '\r\n';
    }
    else{
      responseStatus = 'HTTP/1.1 404 Not Found';
      responseHeaders = '\r\n';
      responseBody = '\r\n';
    }

    if(headers['connection']){
      responseHeaders += `Connection: ${headers['connection']}\r\n`
    }

    const acceptEncodingHeader = headers['accept-encoding'];
    if(acceptEncodingHeader){
      const encodings = acceptEncodingHeader.split(',');
      for (const encoding of encodings){
        if(encoding.trim() === 'gzip'){
          responseHeaders += 'Content-Encoding: gzip\r\n'
          break;
        }
      }
    }

    socket.write(`${responseStatus}${responseHeaders}${responseBody}`);
    if(headers['connection'] === 'close'){
      socket.end();
    }
  })
});

server.listen(4221, "localhost");
