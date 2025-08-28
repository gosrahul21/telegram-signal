import { Socket } from 'socket.io';
export declare class SocketAuthMiddleware {
    use(socket: Socket, next: Function): any;
}
