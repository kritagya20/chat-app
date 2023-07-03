import React from 'react'
import ChatHeader from './ChatHeader'
import Messages from './Messages'
import { useChatContext } from '@/context/chatContext'
import ChatFooter from './ChatFooter'
import { useAuth } from '@/context/authContext'
import { global } from 'styled-jsx/css'

const Chat = () => {

  const {currentUser} = useAuth();
  const {data, users} = useChatContext();

  //hiding the menu when clicked anywhere else
  const handleClickAway = () => {
    setShowMenu(false);
  }

  //it checks and stores the data of selected id which is blocked by the logged in  user 
  const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(u => data.user.uid);

  //its checks and stores the data if logged in user is blocked by the selected chat user
  const IamBlocked = users[data.user.uid]?.blockedUsers?.find(u => currentUser.uid);


  return (
    <div className='flex flex-col grow'>
      <ChatHeader />
      {data.chatId && <Messages />}
      {!IamBlocked && !isUserBlocked && <ChatFooter />}



      {isUserBlocked &&(    
        <div className="capitalize w-full text-center text-c3 py-5">
          This user has been blocked
        </div>
      )}

      {IamBlocked &&(    
        <div className="capitalize w-full text-center text-c3 py-5">
          {`${data.user.displayName} has blocked you!`}
        </div>
      )}


    </div>


  )
}

export default Chat
