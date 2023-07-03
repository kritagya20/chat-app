import { useChatContext } from '@/context/chatContext'
import { db } from '@/firbase/firebase';
import { Timestamp, collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import { RiSearch2Line } from 'react-icons/ri';
import Avatar from './Avatar';
import { useAuth } from '@/context/authContext';
import { formatDate } from '@/utils/helper';

const Chats = () => {

  const [search, setSearch] = useState("");
  const [unreadMessages, setUnreadMessages] = useState([]);


  const { currentUser } = useAuth();


  //destructuring the useChatContext for accessing and updating the list of available users in out application
  const {
    users, setUsers,
    chats, setChats,
    selectedChat, setSelectedChat,
    dispatch, data
  } = useChatContext();

  const isBlockExecutedRef = useRef(false);
  const isUsersFetchedRef = useRef(false);
  
  useEffect(() => {
    //Getting the real time data for all the available users in our application
    onSnapshot(collection(db, "users"), (snapshot) => {
      const updatedUsers = {}; // creating an empty object that will store the data of the users available, fetched from firebase 
      snapshot.forEach((doc)=> {
        updatedUsers[doc.id] = doc.data(); //storing the the data of the users in key value pairs. key(id): value(all data of the specific user)
        console.log(doc.data());
      });
      setUsers(updatedUsers); //updating the user list
      if(!isBlockExecutedRef.current) {
        isUsersFetchedRef.current = true; //setting the fetch user variable true
      }
    
    })
  }, []);

  useEffect(()=>{
    const documentIds = Object.keys(chats);
    if(documentIds.length === 0) return; //while do nothing is chats length is 0
    
    //firebase function to run different queries on our database
    const q = query(
      collection(db,'chats'),
      where('__name__', 'in', documentIds)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let msgs = {}; //initiating an array that will contain the list of unread messsages
      snapshot.forEach((doc) => {
        //targeting all the chats apart from  the selected chats
        if(doc.id !== data.chatId) {
          //The code assigns a filtered array of messages to the `msgs` object using the document ID (`doc.id`) as the key. The filtering condition checks for messages where the `read` property is `false` and the `sender` is not equal to the current user's UID (`currentUser.uid`). Only the messages that meet this condition are included in the filtered array.
          msgs[doc.id]= doc.data().messages.filter((m) => m?.read === false && m?.sender !== currentUser.uid)
        }

        Object.keys(msgs || {})?.map( (c) => {
          if(msgs[c]?.length < 1) {
            delete msgs[c];
          }  
        });
      });

      //storing the list of unreading messages in the local state
      setUnreadMessages(msgs);
    });
    return () => unsub();
  }, [chats,selectedChat]);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, 'userChats', currentUser.uid), (doc) => {
        if(doc.exists()) {
          const data = doc.data(); //extracting the relevant data of the user chats
          setChats(data);// storing the data of the user in the local state
        
          //this block will run only once only when application is loaded
          if(!isBlockExecutedRef.current && isUsersFetchedRef.current && users) {
            const firstChat = Object.values(data)
            .filter(chat => !chat.hasOwnProperty('chatDeleted')) //it will ignore the data which contains chat deleted property 
            .sort((a,b) => b.date - a.date)[0]; //saving the data of the first chat form the list

            if(firstChat) {
              const user = users[firstChat?.userInfo?.uid];

              handleSelect(user); //passing the user information form the first chat of the list
              
              const chatId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid; //reconstructing the chat id to access the read reciept
              
              readChat(chatId);
            }
            isBlockExecutedRef.current = true; //changing the boolean state to ensure out block execution is completed
          }
        }
      })
    };
    //executing the above function when user is logged in
    currentUser.uid && getChats();
  },[isBlockExecutedRef.current, users]);

  const filteredChats = Object.entries(chats || {})   //converting the chat object into array for filtering and sorting
  .filter(([, chat]) => !chat.hasOwnProperty('chatDeleted')) //it will ignore the data which contains chat deleted property 
  .filter(([, chat]) => //filter chats and avoiding the initial index of out array (becuase initial index is id which is relavent in filtering)
    chat?.userInfo?.displayName
    .toLowerCase()
    .includes(search.toLocaleLowerCase())  || 
    chat?.lastMessage?.text
    .toLowerCase()
    .includes(search.toLocaleLowerCase())
  ) //filtering chats based on search input, checking if user's display name or email includes search (case-insensitive). Return filtered array.
  .sort((a,b) => b[1].date - a[1].date); //Sort the array of chats in descending order based on the date property of each chat object. This ensures that the chats are arranged from the most recent to the oldest.

  //updating the read - unread value in the firebase database
  const readChat = async(chatId) => {
    const chatRef = doc(db, "chats", chatId); //refrence of the document
    const chatDoc = await getDoc(chatRef); //getting the document from firebase database

    //updating read value to true on each message
    let updatedMessages = chatDoc.data().messages.map((m) => {
      if(m?.read === false) {
        m.read = true;
      }
      return m;
    });

    //updating the new object in the firebase database
    await updateDoc(chatRef, {
      messages: updatedMessages
    });
  }

  const handleSelect = (user, selectedChatId) => {
    
    setSelectedChat(user);
    dispatch({type: 'CHANGE_USER', payload: user}); //reducer function

    //clearing the unread messages batch when the user read the messages
    if(unreadMessages?.[selectedChatId]?.length > 0){
      readChat(selectedChatId);
    }
  }

  return (
    <div className='flex flex-col h-full'>
      <div className=" shrink-0 sticky -top-[20px] z-10 flex justify-center w-full bg-c2 py-5">
        <RiSearch2Line className='absolute top-9 left-12 text-c3' />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search Username...'
          className='w-[300px] h-12 rounded-xl bg-c1/[0.5] pr-5 pl-11 placeholder:text-c3 outline-none text-base'
        />
      </div>

      <ul className='flex flex-col w-full my-5 gap-[2px]'>
        {/* displaying the chat list only when it exist else not displaying for new user who had no chat history */}
        {Object.keys(users || {}).length > 0 && filteredChats?.map((chat) => {
          
          //firebase function to access time in readable format
          const timestamp = new Timestamp(
            chat[1]?.date?.seconds,
            chat[1]?.date?.nanoseconds,
          );

          //firebase functon to convert time and date into dd mm yyyy format
          const date = timestamp.toDate();
          
          const user = users[chat[1].userInfo.uid]
          
          return (
            <li 
              key={chat[0]}
              onClick={()=> handleSelect(user, chat[0])}
              className={`h-[90px] flex items-center gap-4 rounded-3xl hover:bg-c1 p-4 cursor-pointer 
              ${selectedChat?.uid === user?.uid? "bg-c1" : ""}`}
            >
            <Avatar size='x-large' user={user} />
            <div className="flex flex-col gap-1 grow relative">
              <span className="flex text-base text-white item-center justify-between">
                <div className='font-medium'>{user?.displayName}</div>
                <div className='text-c3 text-xs'>{formatDate(date)}</div>
              </span>
              <p className='text-sm text-c3 line-clamp-1 break-all'>
                {/* displying Last Text Message from the chat history OR display "image" if last message in the history is image OR displaying "send a message" if user has no chat history  */}
                {chat[1]?.lastMessage?.text || (chat[1]?.lastMessage?.img && "Image") || "Send First Message"}
              </p>
              { !!unreadMessages?.[chat[0]]?.length && (
                <span className="absolute right-0 top-7 min-w-[20px] h-5 rounded-full bg-red-500 flex justify-center items-center text-sm">
                  {unreadMessages?.[chat[0]]?.length}
                </span>
              )}
            </div>
            </li>         
          );
        })}

      </ul>
    </div>
  )
}

export default Chats
