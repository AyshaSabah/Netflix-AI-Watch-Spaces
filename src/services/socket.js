import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // In browser, connects to current host on same port
    socket = io(window.location.origin, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Watch Spaces real-time socket:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from socket server:', reason);
    });
  }

  return socket;
};
