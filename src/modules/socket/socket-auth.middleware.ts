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
      console.log(
        'Auth middleware - Token received:',
        token ? 'Present' : 'Missing',
      );
      console.log('Auth middleware - Handshake auth:', socket.handshake.auth);
      console.log('Auth middleware - Handshake query:', socket.handshake.query);

      if (!token) {
        console.log('Auth middleware - No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - Token verified successfully:', payload);
      socket.data = { user: payload }; // Save user info to socket
      next();
    } catch (err) {
      console.error(
        'Auth middleware - Token verification failed:',
        err.message,
      );
      return next(new Error(`Authentication error: ${err.message}`));
    }
  }
}
