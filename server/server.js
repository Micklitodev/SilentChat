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

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinGroup', (groupName, username) => {
        socket.join(groupName);
        socket.emit('message', { content: `Welcome to ${groupName}`, username: 'Server' });
        io.to(groupName).emit('message', { content: `${username} joined the group.`, username: 'Server' });
    });

    socket.on('message', (msg) => {
        io.to(msg.groupName).emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
