"use client"

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Input from '../ui/input';
import Button from '../ui/button';
import { usePathname } from 'next/navigation';

const socket = io(`http://localhost:3001`);

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);
  const promptShown = useRef(false);
  const pathname = usePathname()
  const groupName = pathname.split('/').pop();

  const scrollToBottom = () => {
    //@ts-ignore
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };


  useEffect(() => {
    const joinGroup = async () => {
      const groupName = pathname.split('/').pop();

      if (!username && !promptShown.current) {
        const user = prompt('Please enter your username:');

        if (user === null || user.trim() === '') {
          return;
        }

        setUsername(user);
        promptShown.current = true;
      }

      if (groupName && username) {
        await new Promise(resolve => {
          socket.emit('joinGroup', groupName, username, resolve);
        });
      }
    };

    joinGroup();
  }, [username, pathname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    socket.emit('message', { content: messageInput, username, groupName });
    setMessageInput('');
  };

  const handleDisconnect = () => {
    socket.disconnect();
    window.location.assign('/');
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const handleMessage = (msg: any) => {
      //@ts-ignore
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, []);

  return (
    <>
      <Button onClick={() => handleDisconnect()} className="border border-white rounded px-2 py-2 ml-4">
        ← Exit
      </Button>
      <div className='ml-16'>

        <div className='flex'> 
        <div id='messagebox' className='mt-10 border border-white rounded-md px-2 w-[90vw] h-[60vh] overflow-y-scroll overflow-x-hidden'>
          <div className='text-center'> - {groupName} - </div>
          <hr></hr>
          <ul>
            {messages.map((msg: any, index) => (
              <div key={index}>

                <li className='flex'> {msg.username}: <p className='text-green-400 ml-2'> {msg.content} </p></li>
              </div>
            ))}
          </ul>
          <div ref={messagesEndRef} />
        </div>

        {/* <div id='usernamearea' className=' mt-10 border border-white rounded-md px-2 w-[20vw] h-[60vh] overflow-y-scroll overflow-x-hidden'>
          <div className='text-center'> Users: </div>
          <hr></hr>
          <ul>
            <li> Steveeyyb </li>
            <li> MagicTrilly123 </li>
            <li> SpaghettiMonsta</li>
            <li> Meep2beep </li>
          </ul>
        </div> */}

        </div>

        <div className='flex' id='typearea'>
          <Input
            className='w-[86.2vw]'
            name='msg'
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className='border border-white rounded px-2' onClick={sendMessage}>
            Send
          </button>
        </div>

      </div>
    </>
  );
}
