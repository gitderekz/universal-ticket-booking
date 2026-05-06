module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinJourney', ({ journeyId }) => {
      if (journeyId) {
        socket.join(`journey:${journeyId}`);
        console.log(`User joined journey room: ${journeyId}`);
      }
    });

    socket.on('leaveJourney', ({ journeyId }) => {
      if (journeyId) {
        socket.leave(`journey:${journeyId}`);
      }
    });

    socket.on('seatHeld', ({ journeyId, seats, userId }) => {
      if (journeyId) {
        socket.to(`journey:${journeyId}`).emit('seatsHeld', {
          seats,
          userId,
          sessionId: socket.id,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('seatReleased', ({ journeyId, seats, userId }) => {
      if (journeyId) {
        socket.to(`journey:${journeyId}`).emit('seatsReleased', {
          seats,
          userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
