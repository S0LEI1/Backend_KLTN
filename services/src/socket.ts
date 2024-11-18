import { Server } from 'socket.io';
import http from 'http';
const WEBSOCKET_CORS = {
  origin: '*',
  methods: ['GET', 'POST'],
};

class Websocket extends Server {
  private static io: Server;

  constructor(httpServer: http.Server) {
    super(httpServer, {
      cors: {
        origin: 'https://kimbeautyspa/client',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      },
    });
  }
  static init = (httpServer: http.Server) => {
    Websocket.io = require('socket.io')(httpServer);
    return Websocket.io;
  };
  static getIO = () => {
    if (!Websocket.io) {
      throw new Error('Socket.io not initialized!');
    }
    return Websocket.io;
  };
}

export default Websocket;
