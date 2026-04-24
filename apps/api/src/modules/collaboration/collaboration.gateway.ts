import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as Y from 'yjs';

interface Awareness {
  userId: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

@WebSocketGateway({ cors: true })
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private docs = new Map<string, Y.Doc>();
  private awareness = new Map<string, Map<string, Awareness>>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.awareness.forEach((awareness, docId) => {
      awareness.delete(client.id);
      this.server.to(docId).emit('awareness', Array.from(awareness.values()));
    });
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; userId: string; name: string },
  ) {
    const { documentId, userId, name } = data;
    client.join(documentId);

    let doc = this.docs.get(documentId);
    if (!doc) {
      doc = new Y.Doc();
      this.docs.set(documentId, doc);
      this.awareness.set(documentId, new Map());
    }

    const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const docAwareness = this.awareness.get(documentId);
    if (!docAwareness) return { state: new Uint8Array(), awareness: [] };
    
    const colorIndex = docAwareness.size % userColors.length;

    const awareness: Awareness = { userId, name, color: userColors[colorIndex] };
    docAwareness.set(client.id, awareness);

    client.to(documentId).emit('awareness', Array.from(docAwareness.values()));

    return {
      state: Y.encodeStateAsUpdate(doc),
      awareness: Array.from(docAwareness.values()),
    };
  }

  @SubscribeMessage('update')
  handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; update: number[] },
  ) {
    const doc = this.docs.get(data.documentId);
    if (doc) {
      Y.applyUpdate(doc, new Uint8Array(data.update));
      client.to(data.documentId).emit('update', data.update);
    }
  }

  @SubscribeMessage('cursor')
  handleCursor(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; cursor: { x: number; y: number } },
  ) {
    const docAwareness = this.awareness.get(data.documentId);
    if (!docAwareness) return;
    
    const awareness = docAwareness.get(client.id);
    if (awareness) {
      awareness.cursor = data.cursor;
      client.to(data.documentId).emit('awareness', Array.from(docAwareness.values()));
    }
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string }) {
    client.leave(data.documentId);
    const docAwareness = this.awareness.get(data.documentId);
    if (!docAwareness) return;
    
    docAwareness.delete(client.id);
    client.to(data.documentId).emit('awareness', Array.from(docAwareness.values()));
  }
}