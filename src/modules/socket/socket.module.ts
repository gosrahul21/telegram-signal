import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { SocketAuthMiddleware } from './socket-auth.middleware';

@Module({
  providers: [SocketService, SocketGateway, SocketAuthMiddleware],
  exports: [SocketService],
})
export class SocketModule {}
