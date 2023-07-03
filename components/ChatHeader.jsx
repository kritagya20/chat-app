import { useChatContext } from '@/context/chatContext';
import React, { useState } from 'react'
import Avatar from './Avatar';
import Icon from './Icon';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import ChatMenu from './ChatMenu';
import { global } from 'styled-jsx/css';


const ChatHeader = () => {
    const [showMenu, setShowMenu] = useState(false);
    const {users, data} = useChatContext();

    const online = users[data.user.uid]?.isOnline;
    const user = users[data.user.uid];


  return (
    <div className='p-bg-light flex justify-between items-center py-2 px-1 border-b border-white/[0.05]'>
        {user && (
            <div className="flex items-center gap-3">
            <Avatar size="large" user={user} />
            <div>
                <div className="font-medium">
                    {user.displayName}
                </div>
                <p className="text-sm text-c3">
                    {online ? "Online": "Offline"}
                </p>
            </div>
        </div>
        )}

        <div className="flex items-center gap-2">
            <Icon 
                size='large' 
                className={`p-2 ${showMenu ? 'bg-c1 ': ''}`}
                onClick={()=> setShowMenu(true)}
                icon={<IoEllipsisVerticalSharp 
                    size={20}
                    className='text-c3'
                />}
            />
            {showMenu && (<ChatMenu setShowMenu={setShowMenu} showMenu={showMenu}/>)}
        </div>
    </div>
  )
}

export default ChatHeader
