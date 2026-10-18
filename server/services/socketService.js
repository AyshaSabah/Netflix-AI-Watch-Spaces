import { inMemoryStore } from '../config/inMemoryStore.js';
import WatchRoom from '../models/WatchRoom.js';
import ChatMessage from '../models/ChatMessage.js';
import { getIsMongoConnected } from '../config/db.js';

// Connected clients mapping: socketId -> { roomId, user }
const activeSockets = new Map();
// Room state cache for fast synchronization: roomId -> { isPlaying, currentTime, hostId, activeUsers: Set }
const roomStates = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New Socket.io client connected: ${socket.id}`);

    // Join a Watch Space Room
    socket.on('join:room', async ({ roomId, user }) => {
      if (!roomId) return;
      const cleanRoomId = roomId.toUpperCase();

      socket.join(cleanRoomId);
      activeSockets.set(socket.id, { roomId: cleanRoomId, user });

      // Initialize or retrieve cached room state
      if (!roomStates.has(cleanRoomId)) {
        const storedRoom = inMemoryStore.getRoomById(cleanRoomId);
        roomStates.set(cleanRoomId, {
          isPlaying: storedRoom ? storedRoom.isPlaying : false,
          currentTime: storedRoom ? storedRoom.currentTime : 0,
          hostId: storedRoom ? storedRoom.hostId : (user?.id || 'host'),
          activeUsers: new Map(),
        });
      }

      const roomState = roomStates.get(cleanRoomId);
      if (user && user.id) {
        roomState.activeUsers.set(user.id, {
          id: user.id,
          name: user.name || 'Anonymous Viewer',
          avatar: user.avatar,
          isHost: roomState.hostId === user.id,
        });
      }

      // Send initial room state & past messages to joining client
      const initialMessages = inMemoryStore.getMessagesByRoom(cleanRoomId);

      socket.emit('room:state', {
        roomId: cleanRoomId,
        isPlaying: roomState.isPlaying,
        currentTime: roomState.currentTime,
        hostId: roomState.hostId,
        activeUsers: Array.from(roomState.activeUsers.values()),
        messages: initialMessages,
      });

      // Broadcast to others that a new user joined
      socket.to(cleanRoomId).emit('user:joined', {
        user,
        activeUsers: Array.from(roomState.activeUsers.values()),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Also create a system chat message
      if (user && user.name) {
        const sysMsg = inMemoryStore.addMessage({
          roomId: cleanRoomId,
          userId: 'system',
          userName: 'System',
          message: `${user.name} joined the watch party.`,
          isSystem: true,
        });
        io.to(cleanRoomId).emit('chat:message', sysMsg);
      }
    });

    // Host Play Event
    socket.on('video:play', ({ roomId, currentTime, userId }) => {
      if (!roomId) return;
      const cleanRoomId = roomId.toUpperCase();
      const state = roomStates.get(cleanRoomId);

      if (state) {
        state.isPlaying = true;
        state.currentTime = currentTime || 0;
        inMemoryStore.updateRoomState(cleanRoomId, { isPlaying: true, currentTime: state.currentTime });
      }

      // Broadcast to other viewers in the room
      socket.to(cleanRoomId).emit('video:play', {
        currentTime,
        senderId: userId,
      });
    });

    // Host Pause Event
    socket.on('video:pause', ({ roomId, currentTime, userId }) => {
      if (!roomId) return;
      const cleanRoomId = roomId.toUpperCase();
      const state = roomStates.get(cleanRoomId);

      if (state) {
        state.isPlaying = false;
        state.currentTime = currentTime || 0;
        inMemoryStore.updateRoomState(cleanRoomId, { isPlaying: false, currentTime: state.currentTime });
      }

      // Broadcast to other viewers in the room
      socket.to(cleanRoomId).emit('video:pause', {
        currentTime,
        senderId: userId,
      });
    });

    // Host Seek / Scrubber Event
    socket.on('video:seek', ({ roomId, currentTime, userId }) => {
      if (!roomId) return;
      const cleanRoomId = roomId.toUpperCase();
      const state = roomStates.get(cleanRoomId);

      if (state) {
        state.currentTime = currentTime;
        inMemoryStore.updateRoomState(cleanRoomId, { currentTime });
      }

      // Broadcast seek to other viewers
      socket.to(cleanRoomId).emit('video:seek', {
        currentTime,
        senderId: userId,
      });
    });

    // Request Sync from Room State
    socket.on('video:sync-request', ({ roomId }) => {
      if (!roomId) return;
      const cleanRoomId = roomId.toUpperCase();
      const state = roomStates.get(cleanRoomId);

      if (state) {
        socket.emit('video:sync-response', {
          isPlaying: state.isPlaying,
          currentTime: state.currentTime,
        });
      }
    });

    // Live Chat Message
    socket.on('chat:send', async ({ roomId, message, user }) => {
      if (!roomId || !message || !message.trim()) return;
      const cleanRoomId = roomId.toUpperCase();

      const newMsg = inMemoryStore.addMessage({
        roomId: cleanRoomId,
        userId: user?.id || socket.id,
        userName: user?.name || 'Anonymous',
        userAvatar: user?.avatar,
        message: message.trim(),
        isSystem: false,
      });

      // Try saving to MongoDB if connected
      if (getIsMongoConnected()) {
        try {
          await ChatMessage.create({
            roomId: cleanRoomId,
            userId: user?.id || socket.id,
            userName: user?.name || 'Anonymous',
            userAvatar: user?.avatar,
            message: message.trim(),
          });
        } catch (err) {
          // Safe to ignore mongo error when using in-memory store
        }
      }

      // Broadcast message to everyone in the room (including sender)
      io.to(cleanRoomId).emit('chat:message', newMsg);
    });

    // Floating Emoji Reaction (🍿, ❤️, 😂, 🔥, etc.)
    socket.on('reaction:send', ({ roomId, emoji, user }) => {
      if (!roomId || !emoji) return;
      const cleanRoomId = roomId.toUpperCase();

      io.to(cleanRoomId).emit('reaction:received', {
        emoji,
        userName: user?.name || 'Someone',
        id: Date.now() + Math.random(),
      });
    });

    // Transfer Host Privileges
    socket.on('host:transfer', ({ roomId, newHostId, newHostName }) => {
      if (!roomId || !newHostId) return;
      const cleanRoomId = roomId.toUpperCase();
      const state = roomStates.get(cleanRoomId);

      if (state) {
        state.hostId = newHostId;
        inMemoryStore.updateRoomState(cleanRoomId, { hostId: newHostId, hostName: newHostName });

        if (state.activeUsers.has(newHostId)) {
          state.activeUsers.get(newHostId).isHost = true;
        }

        io.to(cleanRoomId).emit('host:updated', {
          newHostId,
          newHostName,
          activeUsers: Array.from(state.activeUsers.values()),
        });
      }
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      const clientInfo = activeSockets.get(socket.id);
      if (clientInfo) {
        const { roomId, user } = clientInfo;
        const state = roomStates.get(roomId);

        if (state && user?.id) {
          state.activeUsers.delete(user.id);
          socket.to(roomId).emit('user:left', {
            userId: user.id,
            userName: user.name,
            activeUsers: Array.from(state.activeUsers.values()),
          });
        }
        activeSockets.delete(socket.id);
      }
    });
  });
};
