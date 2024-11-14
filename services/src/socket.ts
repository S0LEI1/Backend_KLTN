import { Server } from 'socket.io';
import http from 'http';
const WEBSOCKET_CORS = {
  origin: '*',
  methods: ['GET', 'POST'],
};

class Websocket extends Server {
  private static io: Websocket;

  constructor(httpServer: http.Server) {
    super(httpServer, {
      cors: WEBSOCKET_CORS,
    });
  }
  static init(httpServer: http.Server) {
    Websocket.io = require('socket.io')(httpServer);
    return Websocket.io;
  }
  public static getInstance(): Websocket {
    if (!Websocket.io) {
      throw new Error('Socket.io not initialized!');
    }
    return Websocket.io;
  }
}

export default Websocket;
