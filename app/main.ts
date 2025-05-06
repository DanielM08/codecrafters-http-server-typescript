import * as net from "net";
import { HttpRequestParser } from "./parsers/http-request-parser";
import { 
  Router,
  EchoGetRouteHandler,
  FilesGetRouteHandler,
  FilesPostRouteHandler,
  UserAgentGetRouteHandler,
  RootRouteRouteHandler
} from "./routes";

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', async (request) => {
    const requestParser = new HttpRequestParser();
    const httpRequest = requestParser.parse(request.toString());
    const args = process.argv.slice(2);
    const directoryPath = args[args.length - 1];

    const router = new Router()
      .addHandler(new EchoGetRouteHandler())
      .addHandler(new FilesGetRouteHandler(directoryPath))
      .addHandler(new FilesPostRouteHandler(directoryPath))
      .addHandler(new UserAgentGetRouteHandler())
      .addHandler(new RootRouteRouteHandler());

    let httpResponse = router.route(httpRequest);

    if(httpRequest.headers['connection']){
      httpResponse.setHeader('Connection', httpRequest.headers['connection']);
    }

    const response = httpResponse
      .applyCompression(httpRequest.headers['accept-encoding'])
      .toBuffer();

    socket.write(response);
    if(httpRequest.headers['connection'] === 'close'){
      socket.end();
    }
  })
});

server.listen(4221, "localhost");
