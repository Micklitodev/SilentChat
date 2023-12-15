const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});

const connectedUsersByGroup = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinGroup', (groupName, username) => {
        socket.join(groupName);
        socket.emit('message', { content: `Welcome to ${groupName}`, username: 'Server' });
        io.to(groupName).emit('message', { content: `${username} joined the group.`, username: 'Server' });

        if (!connectedUsersByGroup[groupName]) {
            connectedUsersByGroup[groupName] = {};
        }


        connectedUsersByGroup[groupName][socket.id] = username;

        io.to(groupName).emit('connectedUsers', Object.values(connectedUsersByGroup[groupName]));
    });

    socket.on('message', (msg) => {
        if (msg.content === '') {
            return;
        }
        io.to(msg.groupName).emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        for (const groupName in connectedUsersByGroup) {
            if (connectedUsersByGroup[groupName][socket.id]) {
                delete connectedUsersByGroup[groupName][socket.id];
                io.to(groupName).emit('connectedUsers', Object.values(connectedUsersByGroup[groupName]));
            }
        }
    });

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
