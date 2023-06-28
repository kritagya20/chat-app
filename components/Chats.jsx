import { useChatContext } from '@/context/chatContext'
import { db } from '@/firbase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect } from 'react'


const Chats = () => {
    //destructuring the useChatContext for accessing and updating the list of available users in out application
    const { users, setUsers } = useChatContext();

    useEffect(() => {
        //Getting the real time data for all the available users in our application
        onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = {}; // creating an empty object that will store the data of the users available, fetched from firebase 
            snapshot.forEach((doc)=> {
                updatedUsers[doc.id] = doc.data(); //storing the the data of the users in key value pairs. key(id): value(all data of the specific user)
                console.log(doc.data());
            });
            setUsers(updatedUsers); //updating the user list
        })
    }, [])


  return (
    <div>
      
    </div>
  )
}

export default Chats
