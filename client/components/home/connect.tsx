'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../ui/input';
import Button from '../ui/button';

const Chat = () => {
    const [form, setForm] = useState({ gnJoin: '', password: '' });
    const router = useRouter();

    const handleInputChange = (name: string, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleJoinGroup = () => {
        const groupName = form.gnJoin.trim();
        const password = form.password.trim();
        if (!groupName || !password) return;

        // Password never touches the server — only used client-side to derive the encryption key.
        sessionStorage.setItem(`silentchat-pw-${groupName}`, password);
        router.push(`/chat/${encodeURIComponent(groupName)}`);
    };

    return (
        <div className='border px-20 py-10 mt-10 rounded'>
            <h1 className="mb-10 mt-4 text-center font-bold">*Welcome to SilentChat*</h1>
            <div>
                <p className='max-w-[200px] mb-6'>
                    Enter an existing group name <em>or</em> create a new one. Everyone in the group
                    needs the same room password to read messages — it's never sent to the server.
                </p>
                <Input
                    type="text"
                    id="gnJoin"
                    placeholder='Enter A Group Name'
                    value={form.gnJoin}
                    onChange={(e) => handleInputChange('gnJoin', e.target.value)}
                />
                <Input
                    type="password"
                    id="password"
                    placeholder='Room Password'
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="mt-2"
                />
                <Button
                    className="mt-4"
                    onClick={handleJoinGroup}
                    disabled={!form.gnJoin.trim() || !form.password.trim()}
                >
                    Join Group
                </Button>
            </div>
        </div>
    );
};

export default Chat;