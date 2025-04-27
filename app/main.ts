import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', (request) => {
    const [requestLine, ...headers] = request.toString().split('\r\n'); 

    const [httpVerb, rawPath, httpVersion] = requestLine.split(' ').filter(c => c !== '')
    const path = rawPath.split('/').filter(c => c !== '')

    console.log(httpVerb, httpVersion);
    // console.log(headers);
    // console.log(path)
    if(path[0] === 'echo'){
      const text = path[1];

      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${text.length}\r\n\r\n${text}`);
    }
    else if(path[0] === 'user-agent'){
      let responseHeaders = 'Content-Type: text/plain\r\n';
      let body = '';
      for(const item of headers){
        const [headerField, headerValue] = item.split(':');
        if(headerField.trim().toLowerCase() === 'user-agent'){
          body = headerValue.trim();
          const headerLength = body.length;
          
          responseHeaders += `Content-Length:${headerLength}\r\n`
        }
      }

      socket.write(`HTTP/1.1 200 OK\r\n${responseHeaders}\r\n${body}`);
    }
    else if(path.length === 0){
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
    }
    else{
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
    }
  })
});

server.listen(4221, "localhost");
