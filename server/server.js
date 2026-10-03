const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });

// socket.id -> { groupName, username }
const socketMeta = {};
// groupName -> { socketId: username }
const connectedUsersByGroup = {};

function removeFromGroup(socket, groupName) {
    if (!groupName) return;
    socket.leave(groupName);
    if (connectedUsersByGroup[groupName]) {
        delete connectedUsersByGroup[groupName][socket.id];
        io.to(groupName).emit('connectedUsers', Object.values(connectedUsersByGroup[groupName]));
        if (Object.keys(connectedUsersByGroup[groupName]).length === 0) {
            delete connectedUsersByGroup[groupName];
        }
    }
}

io.on('connection', (socket) => {
    socket.on('joinGroup', (groupName, username, callback) => {
        if (typeof groupName !== 'string' || typeof username !== 'string') return;
        groupName = groupName.trim().slice(0, 50);
        username = username.trim().slice(0, 30);
        if (!groupName || !username) return;

        const prevMeta = socketMeta[socket.id];
        if (prevMeta && prevMeta.groupName !== groupName) {
            removeFromGroup(socket, prevMeta.groupName);
        }

        socket.join(groupName);
        socketMeta[socket.id] = { groupName, username };

        if (!connectedUsersByGroup[groupName]) {
            connectedUsersByGroup[groupName] = {};
        }
        connectedUsersByGroup[groupName][socket.id] = username;

        io.to(groupName).emit('connectedUsers', Object.values(connectedUsersByGroup[groupName]));

        if (typeof callback === 'function') callback();
    });

    socket.on('leaveGroup', (groupName) => {
        removeFromGroup(socket, groupName);
        delete socketMeta[socket.id];
    });

    // Server only ever relays ciphertext (iv/data) — it never sees plaintext content.
    socket.on('message', (msg) => {
        if (!msg || typeof msg.groupName !== 'string' || typeof msg.iv !== 'string' || typeof msg.data !== 'string') {
            return;
        }
        const username = typeof msg.username === 'string' ? msg.username.slice(0, 30) : 'Unknown';
        io.to(msg.groupName).emit('message', {
            username,
            iv: msg.iv,
            data: msg.data,
        });
    });

    socket.on('disconnect', () => {
        const meta = socketMeta[socket.id];
        if (meta) {
            removeFromGroup(socket, meta.groupName);
            delete socketMeta[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});