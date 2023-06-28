import { db } from '@/firbase/firebase';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { useState } from 'react'
import { RiSearch2Line } from 'react-icons/ri'
import Avatar from './Avatar';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
const Search = () => {

    //state to save the name searched by the user
    const [userName, setUserName] = useState("");
    
    //state to identify the whether searched user data is recieved back from firebase or not
    const [user, setUser] = useState(null);

    //state to identify the error occurred during the process of searching the data
    const [err, setErr] = useState(false);
    
    //destructuring the 
    const {currentUser} = useAuth();
    const {users, dispatch} = useChatContext();

    
    //searching the data from the firebase 
    const onkeyup = async (e) =>{
        if (e.code === "Enter" && !!userName){
            try {
                
                setErr(false); //setting up the error function false as no error occurred

                //accessing the collection object in the firebase database
                const userRef = collection(db, "users");

                //running the query on firebase database to search with data having similar displayNames
                const q = query(userRef, where('displayName', '==', userName));

                //getting the data that matches the search results
                const querySnapshot = await getDocs(q);

                //error handling if the no data found while searching in database
                if(querySnapshot.empty) {
                    setErr(true);
                    setUser(null);
                } else {
                    //storing the data extracted from the firebase database  
                    querySnapshot.forEach((doc) => {
                        setUser(doc.data());
                    });
                }
            } catch (error) {
                console.error(error);
                setErr(error);
            }
        }
    }

    const handleSelect = async () => {
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
              [combinedId + ".date"]: serverTimestamp() //passing the  server's timestamp when the data is being written
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
              [combinedId + ".date"]: serverTimestamp() //passing the  server's timestamp when the data is being written
            })
            
          } else {
            //chat doc exists if user had a chat history
          }
          
          //setting the initial values of the states
          setUser(null);
          setUserName("");
          dispatch({type: 'CHANGE_USER', payload: user}); //reducer update function
        } catch (error) {
          console.error(error);
        }
      }


  return (
    <div className='shrink-0'>
      <div className='relative'>
        {/* serchIcon */}
        <RiSearch2Line className='absolute top-4 left-4 text-c3'/>
        <input  
            type="text"
            placeholder='Search User...'
            onChange={(e)=> setUserName(e.target.value)} 
            onKeyUp={onkeyup}
            value={userName}
            autoFocus
            className='w-full h-12 rounded-xl bg-c1/[0.5] pl-11 pr-16 placeholder:text-c3 outline-none text-base'
        />
        <span className='absolute top-[14px] right-4 text-sm text-c3 ' >Enter</span>
      </div>
        {/* Error Message if no user found in the search */}
        {err && (<>
            <div className="mt-5 w-full text-center text-sm">User Not Found !!!</div>
            <div className="w-full h-[1px] bg-white/[0.1] mt-5"></div>
        </>)}

        {/* Displaying the search result found */}
        {user && (<>
            <div className='mt-5 flex items-center gap-4 rounded-xl hover:bg-c5 py-2 px-4 cursor-pointer' onClick={()=>handleSelect()}>
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
            <div className="w-full h-[1px] bg-white/[0.1] mt-5"></div>
        </>)}

    </div>
  )
}

export default Search
