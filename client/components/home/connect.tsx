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
        <div className='border px-20 py-10 mt-10 rounded'>
            <h1 className="mb-10 mt-4 text-center font-bold">*Welcome to SilentChat*</h1>
            <div>
                <p className='max-w-[200px] mb-6'> Enter an existing group name <em> or </em>  Create a new group by entering random group name. </p>
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
