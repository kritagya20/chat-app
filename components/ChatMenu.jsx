import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import { db } from '@/firbase/firebase';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import React from 'react';
import ClickAwayListener from 'react-click-away-listener';


const ChatMenu = ({setShowMenu, showMenu}) => {

  const {currentUser} = useAuth();
  const {data, users, chats, dispatch, setSelectedChat} = useChatContext();

  //hiding the menu when clicked anywhere else
  const handleClickAway = () => {
    setShowMenu(false);
  }

  //it checks and stores the data of selected id which is blocked by the logged in  user 
  const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(u => data.user.uid);

  //its checks and stores the data if logged in user is blocked by the selected chat user
  const IamBlocked = users[data.user.uid]?.blockedUsers?.find(u => currentUser.uid);


  //fuction to block the user in the firebase database
  const handleBlock = async(action) => {
    if(action === 'block'){
      await updateDoc(doc(db, 'users', currentUser.uid), {
        blockedUsers: arrayUnion(data.user.uid)
      });
    }

    if(action === 'unblock'){
      await updateDoc(doc(db, 'users', currentUser.uid), {
        blockedUsers: arrayRemove(data.user.uid)
      });
    }
  }
  
  const handleDelete = async() => {
    try {
      const chatRef = doc(db, 'chats', data.chatId); //getting the document reference
      const chatDoc = await getDoc(chatRef); //get the object from  the  firebase database

      //inserting a new object (delelted chat info) in each message that contains the id of user that deleted the chats
      const updatedMessages = chatDoc.data().messages.map(message => {
        message.deleteChatInfo = {
          ...message.deleteChatInfo,
          [currentUser.uid]: true
        }
        return message
      });

      //updating the firebase database with updated object
      await updateDoc(chatRef,{
        messages: updatedMessages
      });

      //inserting the new key value pair in usersChat regarding deleted chat to remove the chat profile from the chat list section
      await updateDoc(doc(db, 'userChats', currentUser.uid), {
        [data.chatId + ".chatDeleted"]: true,
      });

      const filteredChats = Object.entries(chats || {})
            .filter(([id, chat]) => id !== data.chatId)
            .sort((a,b)=> b[1].date - a[1].date)

      if(filteredChats.length > 0) {
        setSelectedChat(filteredChats?.[0]?.[1]?.userInfo);

        dispatch({
          type: 'CHANGE_USER',
          payload: filteredChats?.[0]?.[1]?.userInfo
        })
      } else {
        dispatch({type: 'EMPTY'})
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className='w-[150px] absolute top-[70px] right-5 bg-c0 z-10 rounded-md overflow-hidden'>
        <ul className="flex flex-col py-2">
          {!IamBlocked &&(
            <li 
              className="capitalize text-sm flex items-center py-3 px-5 hover:bg-black cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleBlock(isUserBlocked ? 'unblock' : 'block');
                setShowMenu(false);
              }}
            >
              {isUserBlocked ? 'unblock' : 'block user'}
            </li>
          )}
          <li 
            className="capitalize text-sm flex items-center py-3 px-5 hover:bg-black cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
              setShowMenu(false);
            }}
          >
            Delete Chat
          </li>
        </ul>
    </div>

    </ClickAwayListener>
  )
}

export default ChatMenu
