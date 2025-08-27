// socket-auth.middleware.ts
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SocketAuthMiddleware {
  use(socket: Socket, next: Function) {
    try {
      // token from socket handshake
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data = { user: payload }; // Save user info to socket
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  }
}
