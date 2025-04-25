import * as net from "net";

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', (request) => {
    const [httpVerb, reqTarget, ...rest] = request.toString().split(' '); 

    if(reqTarget !== '/'){
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
    }
    else{
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
    }
  })
});

server.listen(4221, "localhost");
