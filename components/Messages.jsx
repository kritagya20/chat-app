import { useChatContext } from '@/context/chatContext';
import { db } from '@/firbase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import Message from './Message';
import { DELETED_FOR_ME } from '@/utils/constants';
import { useAuth } from '@/context/authContext';

const Messages = () => {
  const {currentUser} = useAuth()
  const {data} = useChatContext();

  //state to store the messages extracted from firebase database
  const [messages, setMessages] = useState([]);

  //created to provide auto scroll to the chat section whenever new message is added
  const ref = useRef();

  //use Effect that will run everytime the chats are changed. 
  useEffect(()=> {
    //fuction to take realtime data from the database
    const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if(doc.exists()) {
        setMessages(doc.data().messages); //storing the messages in local state
      }

      //setTimeout function execute the code in the lase by default
      setTimeout(()=> {
        scrollToBottom();
      }, 0)

    });
    return () => unsub();
  },[data.chatId]);

  //handling the auto scroll when new message is recieved or delivered
  const scrollToBottom = () => {
    const chatContainer = ref.current;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  return (
    <div ref={ref} className='grow p-5 overflow-auto scrollbar flex flex-col'>
        {messages?.filter((m)=> {
          //we are filtering out the deleted messages by the user
          //The code is filtering out deleted messages by the user. It checks each message (`m`) for the presence of `deletedInfo` object. If the `currentUser.uid` is not found in `deletedInfo` or if the message is not marked as deleted for the current user (`!== DELETED_FOR_ME`), and if it is not marked as deleted for everyone (`!m.deletedInfo?.deletedForEveryone?.[currentUser.uid]`), the message is included in the filtered result.
          return m?.deletedInfo?.[currentUser.uid] !== DELETED_FOR_ME && !m.deletedInfo?.deletedForEveryone?.[currentUser.uid]
        })?.map((m) => {
          return <Message  message={m} key={m.id}/>
        })}
    </div>
  )
}

export default Messages
