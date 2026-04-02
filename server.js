const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const expressApp = express();
    const httpServer = createServer(expressApp);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('new_order', (orderData) => {
            console.log('Received new order:', orderData);
            // Broadcast to to all connected admin clients
            io.emit('order_update', orderData);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    // Next.js catch-all
    expressApp.use((req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
