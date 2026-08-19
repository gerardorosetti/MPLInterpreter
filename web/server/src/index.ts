import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import apiRoutes from '@/routes/api';
import authRoutes from '@/routes/auth';
import snippetsRoutes from '@/routes/snippets';
import { setupSockets } from '@/sockets';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetsRoutes);
app.use('/api', apiRoutes);

// Server Setup
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Sockets Setup
setupSockets(io);

// Export app for testing
export { app };

// Start Server only if not imported (for testing)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`MPL Backend API running on port ${PORT}`);
  });
}
