import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[Notifications] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Notifications] Client disconnected: ${client.id}`);
  }

  /**
   * The frontend should call this with the userId after connecting
   * so the user joins their personal notification room.
   */
  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(client: Socket, userId: string) {
    client.join(`user_${userId}`);
    console.log(
      `[Notifications] Client ${client.id} joined room: user_${userId}`,
    );
  }

  @SubscribeMessage('leaveNotifications')
  handleLeaveNotifications(client: Socket, userId: string) {
    client.leave(`user_${userId}`);
    console.log(
      `[Notifications] Client ${client.id} left room: user_${userId}`,
    );
  }

  /**
   * Send a notification to a specific user via WebSocket.
   */
  sendToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
