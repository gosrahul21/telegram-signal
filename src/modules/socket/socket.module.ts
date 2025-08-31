import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { SocketAuthMiddleware } from './socket-auth.middleware';
import { SocketListenerService } from './socket-listener.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    SocketService,
    SocketGateway,
    SocketAuthMiddleware,
    SocketListenerService,
  ],
  exports: [SocketService, SocketListenerService],
})
export class SocketModule {}
