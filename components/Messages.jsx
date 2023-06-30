import { useChatContext } from '@/context/chatContext';
import { db } from '@/firbase/firebase';
import { data } from 'autoprefixer';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'

const Messages = () => {
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
    });
    return () => unsub();
  },[data.chatId]);

  return (
    <div ref={ref} className='grow p-5 overflow-auto scrollbar flex flex-col'>
      
    </div>
  )
}

export default Messages
