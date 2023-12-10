'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../ui/input';
import Button from '../ui/button';

const Chat = () => {
    const [groupName, setGroupName] = useState({ gnJoin: '', username: '' });
    const router = useRouter();

    const handleInputChange = (
        name: string,
        value: string
    ) => {
        setGroupName((prevGroup) => ({
            ...prevGroup,
            [name]: value,
        }));
    };

    const handleJoinGroup = () => {
        router.push(`/chat/${groupName.gnJoin}`);
    };

    return (
        <div>
            <h1 className="mb-10 mt-4">Welcome to Anonmeet</h1>
            <div>
           
                <Input
                    type="text"
                    id="gnJoin"
                    placeholder='Enter A Group Name'
                    value={groupName.gnJoin}
                    onChange={(e) => handleInputChange('gnJoin', e.target.value)}
                />

                <Button
                    className="mt-4"
                    onClick={handleJoinGroup}
                    disabled={!groupName.gnJoin}
                >
                    Join Group
                </Button>
            </div>
        </div>
    );
};

export default Chat;
