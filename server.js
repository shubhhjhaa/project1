const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const fs = require('fs');
const path = require('path');

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

    const DB_PATH = path.join(process.cwd(), 'data.json');

    const readDB = () => {
        try {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } catch (err) {
            console.error("DB Initialization Error: ", err);
            return { menu: [], coupons: [] };
        }
    };

    const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.emit('app_data', readDB());

        socket.on('new_order', (orderData) => {
            console.log('Received new order:', orderData);
            
            // Persist order to database so it isn't lost if admin logs in later
            const db = readDB();
            if (!db.orders) db.orders = [];
            // Prepend new orders so they appear at the top
            db.orders.unshift(orderData);
            writeDB(db);

            io.emit('order_update', orderData);
        });

        socket.on('update_order_status', ({ id, status }) => {
            const db = readDB();
            if (db.orders) {
                const order = db.orders.find(o => o.id === id);
                if (order) {
                    order.status = status;
                    writeDB(db);
                }
            }
            io.emit('order_status_updated', { id, status });
        });

        socket.on('admin_update_menu', (newMenu) => {
            const db = readDB();
            db.menu = newMenu;
            writeDB(db);
            io.emit('app_data', db);
        });

        socket.on('admin_update_coupons', (newCoupons) => {
            const db = readDB();
            db.coupons = newCoupons;
            writeDB(db);
            io.emit('app_data', db);
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
