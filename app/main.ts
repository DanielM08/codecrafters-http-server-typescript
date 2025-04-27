import * as net from "net";
import { readFileSync, writeFileSync } from 'fs';

type Header = Record<string, string>;

function parseHeadersAndRequestBody(elements: string[]){
  let requestBody;
  let headers: Header = {};
  console.log(elements);
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
    console.log(request.toString())
    const [requestLine, ...rest] = request.toString().split('\r\n'); 

    console.log(requestLine)

    const { headers, requestBody } = parseHeadersAndRequestBody(rest);

    const [httpVerb, rawPath, httpVersion] = requestLine.split(' ').filter(c => c !== '');
    const path = rawPath.split('/').filter(c => c !== '');

    if(path[0] === 'echo'){
      const text = path[1];
      let responseHeaders = `Content-Type: text/plain\r\nContent-Length: ${text.length}\r\n`;
      socket.write(`HTTP/1.1 200 OK\r\n${responseHeaders}\r\n${text}`);
    }
    else if(path[0] === 'user-agent'){
      let responseHeaders = 'Content-Type: text/plain\r\n';
      let body = headers['user-agent'] || '';
      responseHeaders += `Content-Length:${body.length}\r\n`;

      socket.write(`HTTP/1.1 200 OK\r\n${responseHeaders}\r\n${body}`);
    }
    else if(path[0] === 'files'){
      let fileName = path[1];

      const args = process.argv.slice(2);
      const absPath = args[args.length - 1];
      const filePath = `${absPath}${fileName}`;

      if(httpVerb === 'GET'){
        try {
          const fileContent = readFileSync(filePath);
          let responseHeaders = `Content-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n`;
          socket.write(`HTTP/1.1 200 OK\r\n${responseHeaders}\r\n${fileContent.toString()}`);
        } catch (error) {
          socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }
      }
      else if(httpVerb === 'POST'){
        try {
          writeFileSync(filePath, requestBody);
          socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
        } catch (error) {
          socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }
      } else {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      }
    }
    else if(path.length === 0){
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
    }
    else{
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    }
  })
});

server.listen(4221, "localhost");
