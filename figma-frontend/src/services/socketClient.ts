import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('accessToken');
  
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Store socket ID in session storage for API requests
  socket.on('connect', () => {
    sessionStorage.setItem('socketId', socket!.id);
    console.log('Socket connected:', socket!.id);
  });

  socket.on('disconnect', () => {
    sessionStorage.removeItem('socketId');
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    sessionStorage.removeItem('socketId');
  }
};

export const joinJourneyRoom = (journeyId: string): void => {
  const sock = getSocket();
  if (sock) {
    sock.emit('joinJourney', { journeyId });
  }
};

export const leaveJourneyRoom = (journeyId: string): void => {
  const sock = getSocket();
  if (sock) {
    sock.emit('leaveJourney', { journeyId });
  }
};

export const broadcastSeatHeld = (journeyId: string, seats: string[], userId: string): void => {
  const sock = getSocket();
  if (sock) {
    sock.emit('seatHeld', { journeyId, seats, userId });
  }
};

export const broadcastSeatReleased = (journeyId: string, seats: string[], userId: string): void => {
  const sock = getSocket();
  if (sock) {
    sock.emit('seatReleased', { journeyId, seats, userId });
  }
};

export const onSeatsHeld = (callback: (data: any) => void): void => {
  const sock = getSocket();
  if (sock) {
    sock.on('seatsHeld', callback);
  }
};

export const onSeatsReleased = (callback: (data: any) => void): void => {
  const sock = getSocket();
  if (sock) {
    sock.on('seatsReleased', callback);
  }
};
