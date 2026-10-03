"use client"

import { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import Input from '../ui/input';
import Button from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { deriveKey, encryptMessage, decryptMessage } from '../helper';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const generateAnonName = () => `Anon${Math.floor(1000 + Math.random() * 9000)}`;

interface ChatMessage {
    username: string;
    content: string;
}

export default function ChatBox() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
    const [ready, setReady] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const groupName = decodeURIComponent(pathname.split('/').pop() || '');

    const socketRef = useRef<Socket | null>(null);
    const keyRef = useRef<CryptoKey | null>(null);
    const usernameRef = useRef('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    useEffect(() => {
        let cancelled = false;

        const setup = async () => {
            if (!groupName) return;

            const password =
                sessionStorage.getItem(`silentchat-pw-${groupName}`) ||
                window.prompt('Enter the room password:');

            if (!password) {
                router.push('/');
                return;
            }
            sessionStorage.setItem(`silentchat-pw-${groupName}`, password);

            const username =
                window.prompt('Enter a username (or leave blank to stay anonymous):', generateAnonName()) ||
                generateAnonName();

            if (cancelled) return;
            usernameRef.current = username;

            const key = await deriveKey(password, groupName);
            if (cancelled) return;
            keyRef.current = key;

            const socket = io(SOCKET_URL, { autoConnect: false });
            socketRef.current = socket;

            socket.on('connectedUsers', (users: string[]) => setConnectedUsers(users));

            socket.on('message', async (msg: { username: string; iv: string; data: string }) => {
                const content = await decryptMessage(keyRef.current!, { iv: msg.iv, data: msg.data });
                setMessages((prev) => [...prev, { username: msg.username, content }]);
            });

            socket.connect();
            socket.emit('joinGroup', groupName, username, () => {
                if (cancelled) return;
                setReady(true);
                setMessages((prev) => [
                    ...prev,
                    { username: 'System', content: `Connected to ${groupName} as ${username}` },
                ]);
            });
        };

        setup();

        return () => {
            cancelled = true;
            const socket = socketRef.current;
            if (socket) {
                socket.emit('leaveGroup', groupName);
                socket.off();
                socket.disconnect();
            }
            setMessages([]);
            setReady(false);
        };
    }, [groupName]);

    const sendMessage = useCallback(async () => {
        const content = messageInput.trim();
        if (!content || !keyRef.current || !socketRef.current) return;

        const encrypted = await encryptMessage(keyRef.current, content);
        socketRef.current.emit('message', {
            username: usernameRef.current,
            groupName,
            iv: encrypted.iv,
            data: encrypted.data,
        });
        setMessageInput('');
    }, [messageInput, groupName]);

    const handleDisconnect = () => {
        socketRef.current?.disconnect();
        router.push('/');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <Button onClick={handleDisconnect} className="border border-white rounded mt-4 px-2 py-2 ml-4">
                ← Disconnect
            </Button>
            <div className='ml-16'>
                <div className='flex'>
                    <div id='messagebox' className='mt-10 border border-white rounded-md px-2 w-[70vw] h-[60vh] overflow-y-scroll overflow-x-hidden'>
                        <div className='text-center'> - {groupName} - </div>
                        <hr />
                        <ul>
                            {messages.map((msg, index) => (
                                <div key={index}>
                                    <li className='flex'> {msg.username}: <p className='text-green-400 ml-2'> {msg.content} </p></li>
                                </div>
                            ))}
                        </ul>
                        <div ref={messagesEndRef} />
                    </div>

                    <div id='usernamearea' className='mt-10 border border-white rounded-md px-2 w-[20vw] h-[60vh] overflow-y-scroll overflow-x-hidden'>
                        <div className='text-center'> Users: </div>
                        <hr />
                        <ul>
                            {connectedUsers.map((user, index) => (
                                <li key={index}>{user}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className='flex' id='typearea'>
                    <Input
                        className='w-[86.2vw]'
                        name='msg'
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={!ready}
                    />
                    <button className='border border-white rounded px-2' onClick={sendMessage} disabled={!ready}>
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}