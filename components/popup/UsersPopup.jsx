import React from 'react'
import PopupWrapper from './PopupWrapper'
import { useAuth } from '@/context/authContext'
import { useChatContext } from '@/context/chatContext'
import Avatar from '../Avatar'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firbase/firebase'
import Search from '../Search'


const UsersPopup = (props) => {
  
  const {currentUser} = useAuth();
  const {users, dispatch} = useChatContext();

  const handleSelect = async (user) => {
    try {
      const combinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid ;//it will generate a unique chat id for chats

      //acessing the database of firebase of that specific id
      const res = await getDoc(doc(db, "chats", combinedId));

      if(!res.exists()) {
        //chat doc doesnt exists if user starts new conversation
        
        //creating a chat document with an empty array of messages
        await setDoc(doc(db, "chats", combinedId), {
          messages: []
        })

        //taking the refrence of the current or logged in user from firebase
        const currentUserChatRef = await getDoc(doc(db, "userChats", currentUser.uid))
        //taking the reference of the clicked or selected user from firebae
        const userChatRef = await getDoc(doc(db, "userChats", currentUser.uid))

        // (for error handling)
        //if the selected refrence doesn't exist then we will create one
        if(!currentUserChatRef.exists()) {
          await setDoc(doc(db, "userChats", user.uid), {
          })
        }

        //updating the userChat object of logged in user and adding the data of the  selected profile
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + '.userInfo']: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
            color: user.color
          },
          [combinedId + ".date"]: serverTimestamp()
        })

        // (for error handling)
        //if the user refrence doesn't exist then we will create one
        if(!userChatRef.exists()) {
          await setDoc(doc(db, "userChats", user.uid), {
          })
        }

        //updating the userChat object of selected profile and adding the data of the  logged in profile that has initiated or requested for chat
        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + '.userInfo']: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || null,
            color: currentUser.color
          },
          [combinedId + ".date"]: serverTimestamp()
        })
        
      } else {
        //chat doc exists if user had a chat history
      }

      dispatch({type: 'CHANGE_USER', payload: user}); //reducer function
      props.onHide();
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <PopupWrapper {...props} >
      <Search />
      <div className='mt-5 flex flex-col gap-2 grow relative overflow-auto scrollbar'>
        <div className='absolute w-full'>
          {users && Object.values(users).map((user) => {
            return (
              <div className='flex items-center gap-4 rounded-xl hover:bg-c5 py-2 px-4 cursor-pointer' onClick={()=>handleSelect(user)}>
              <Avatar size="large" user={user}/>
              <div className='flex flex-col gap-1 grow'>
                <span className="text-base text-white flex items-center justify-between"> 
                  <div className='font-medium'>
                    {user.displayName}
                  </div>
                </span>
                <p className='text-sm text-c3'>
                  {user.email}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </PopupWrapper>
  );
}

export default UsersPopup;
