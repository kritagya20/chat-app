import { useChatContext } from '@/context/chatContext';
import { Timestamp, arrayUnion, deleteField, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/firbase/firebase';
import React from 'react'
import {TbSend } from 'react-icons/tb'
import { v4 as uuid} from 'uuid';
import { useAuth } from '@/context/authContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

let typingTimeOut = null;
const Composebar = () => {

  const {currentUser} = useAuth();
  const { inputText, setInputText, data, attachment, setAttachment, attachmentPreview, setAttachmentPreview} = useChatContext();

  //function to store the input message typed by the user
  const handleTyping = async(e) => {
    setInputText(e.target.value);

    //appending another key value pair in the chats array of which user is typing
    await updateDoc(doc(db, "chats", data.chatId), {
      [`typing.${currentUser.uid}`] : true,
    });

    //clearing typing time out indicator before starting new timeout
    if(typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    typingTimeOut = setTimeout(async()=> {
      //changing the typing value to false after the user stops typing
      await updateDoc(doc(db, "chats", data.chatId), {
        [`typing.${currentUser.uid}`] : false,
      })

      typingTimeOut = null;
    }, 500)

  }

  //function to initiate the message sending
  const onkeyup = (e) => {
    if(e.key === 'Enter' && (inputText || attachment) ) {
      handleSend();
    }
  }

  const handleSend = async () => {

    //if case is for messages with attachments
    if(attachment) {
      // file uploading logic
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, attachment);

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          // Handle unsuccessful uploads
          console.error(error);
        }, 
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
            //updating the chat object in firebase
            await updateDoc(doc(db,"chats", data.chatId),{
              //arrayUnion is a firebase function to push new data into our array
              messages: arrayUnion( {
                id: uuid(), //unique id for each message
                text: inputText, //passing the input message
                sender: currentUser.uid, //passing sender details using his unique id
                date: Timestamp.now(), //exact time on which message was sent
                read: false, //read reciept will we false by default
                img: downloadURL
              })
            });
          });
        }
      );
    }
    //else case is for normal text message
    else {
      //updating the chat object in firebase
      await updateDoc(doc(db,"chats", data.chatId),{
        //arrayUnion is a firebase function to push new data into our array
        messages: arrayUnion( {
          id: uuid(), //unique id for each message
          text: inputText, //passing the input message
          sender: currentUser.uid, //passing sender details using his unique id
          date: Timestamp.now(), //exact time on which message was sent
          read: false //read reciept will we false by default
        })
      });
    }


    let message = { text : inputText }
    if(attachment) {
      message.img = true;
    }
    //updating the doc of logged in user for displaying in the chats section
    await updateDoc(doc(db,"userChats", currentUser.uid),{
      //passing an new key value pair in the user chat object to update the last message in the chats listed section
      [data.chatId + ".lastMessage"] : message,
      [data.chatId + ".date"] : serverTimestamp()
    });

    //updating the doc of user to whom message is sent for displaying in the chats section
    await updateDoc(doc(db,"userChats", data.user.uid),{
      //passing an new key value pair in the user chat object to update the last message in the chats listed section
      [data.chatId + ".lastMessage"] : message,
      [data.chatId + ".date"] : serverTimestamp(),
      [data.chatId + ".chatDeleted"] : deleteField(),
    });

    setInputText(''); //clearing the input message area after sending it to firebase
    setAttachment(null); //clearing the attachment after message is sent
    setAttachmentPreview(null); //removing attachment preview
  }


  return (
    <div className='flex items-center gap-2 grow'>
      <input type="text"
        className='grow w-full outline-0 px-2 py-2 text-white bg-transparent placeholder:text-c3 outline-none text-base'
        placeholder='Type a Message'
        value={inputText}
        onChange={handleTyping}
        onKeyUp={onkeyup}
      />
      <button 
        className={`h-10 w-10 rounded-full shrink-0 flex justify-center items-center ${inputText.trim().length >0 ? 'bg-c4': '' }`}
        onClick={handleSend}  
      >
        <TbSend 
          className='text-white'
          size = {20}
        />
      </button>
    </div>
  )
}

export default Composebar
