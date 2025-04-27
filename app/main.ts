import * as net from "net";

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', (request) => {
    const [httpVerb, reqTarget, ...rest] = request.toString().split(' '); 

    const path = reqTarget.split('/').filter(c => c !== '')
    if(path[0] === 'echo'){
      const text = path[1];

      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${text.length}\r\n\r\n${text}`);
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
