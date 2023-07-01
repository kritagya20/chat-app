import { useAuth } from '@/context/authContext';
import React, { useState } from 'react';
import Avatar from './Avatar';
import { useChatContext } from '@/context/chatContext';
import Image from 'next/image';
import ImageViewer from 'react-simple-image-viewer';
import { Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { formatDate } from '@/utils/helper';
import { wrapEmojisInHtmlTag } from '@/utils/helper';
import Icon from './Icon';
import {GoChevronDown} from 'react-icons/go';
import MessageMenu from './MessageMenu';
import DeleteMessagePopup from './popup/DeleteMessagePopup';
import { db } from '@/firbase/firebase';
import { DELETED_FOR_EVERYONE, DELETED_FOR_ME } from '@/utils/constants';

const Message = ({message}) => {
    const { currentUser } = useAuth();
    const { users, data, imageViewer, setImageViewer } = useChatContext();

    const self = message.sender = currentUser.uid;

    const [showmenu, setShowMenu] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    
    //firebase function to access time in readable format
    const timestamp = new Timestamp(
    message?.date?.seconds,
    message?.date?.nanoseconds,
    );

    //firebase functon to convert time and date into dd mm yyyy format
    const date = timestamp.toDate();

    //function to hide menu and show delete popup
    const deletePopupHandler = () => {
        setShowDeletePopup(true);
        setShowMenu(false);
    }
    
    const deleteMessage = async (action) => {
        try {
            const messageId = message.id; //getting the message id on which user has triggered delete
            const chatRef = doc(db, "chats", data.chatId); 

            //accessing that specific message in the chats object in firebase database
            const chatDoc = await getDoc(chatRef);

            //storing the updated list of messages 
            const UpdatedMessages = chatDoc.data().messages.map((message)=> {
                
                //our messages is a array
                // in which each element message is object
                //we are passing a new object deletedForEveryOne:true if user has triggered deleted of everyone
                //else for delete for me we will pass a new object with key value  --loggedInUser: deleted_for_me -- in message object
                if(message.id === messageId) {
                    if(action === DELETED_FOR_ME) {
                        message.deletedInfo = {
                            [currentUser.uid]: DELETED_FOR_ME 
                        }
                    }

                    if(action === DELETED_FOR_EVERYONE) {
                        message.deletedInfo = {
                            deletedForEveryOne: true
                        }
                    }
                }

                return message;
            })

            await updateDoc(chatRef, {messages: UpdatedMessages}); //updating the firebase database messages object as per the new messages list after removing the deleted message  
            setShowDeletePopup(false); //hiding the delete message popup after deleting the message from firebase database
            
        } catch (error) {
            console.error(error);
        }
    }


  return (
    <div className={`mb-5 max-w-[75%] ${self ? 'self-end' : ''}`}>
        {showDeletePopup && (      
            <DeleteMessagePopup 
                className='DeleteMessagegPopup'
                onHide={()=> setShowDeletePopup(false)}
                noHeader={true}
                shortHeight={true}
                self = {self}
                deleteMessage= {deleteMessage}
            />
        )}
      <div className={`flex items-end gap-3 mb-1 ${self ? 'justify-start flex-row-reverse ': ''}`}>
        <Avatar 
            size='small'
            user = {self ? currentUser : users[data.user.uid]}
            className='mb-4'
        />
        <div className={`group flex flex-col gap-4 p-4 rounded-3xl relative break-all ${self ? 'rounded-br-md bg-c5' : 'rounded-bl-md bg-c1'}`}>
            { message.text && (
                <div
                    className='text-sm'
                    dangerouslySetInnerHTML={{__html: wrapEmojisInHtmlTag(message.text)}}
                >
                </div>
            )}

            { message.img && (
                <>
                    <Image 
                        src={message.img}
                        width={200}
                        height = {225}
                        alt ={message.text || ''}
                        className='rounded-3xl max-w-[250px]'
                        onClick={()=>{setImageViewer({
                            messageId: message.id,
                            url: message.img
                        })}}
                    />
                    {imageViewer && imageViewer.messageId === message.id && (
                        <ImageViewer
                            src={[imageViewer.url]} 
                            currentIndex={0}
                            disableScroll = {false}
                            closeOnClickOutside = {true}
                            onClose={()=> setImageViewer(null)}
                        />
                    )}
                </>
            )}
            <div 
                className={`flex items-end ${showmenu ? '' : 'hidden'} group-hover:flex absolute top-2 ${self ? 'left-2 bg-c5 ': 'right-2 bg-c1'}`}
                onClick={()=> setShowMenu(true)}
            >
               <Icon 
                size='medium'
                className='hover:bg-inherit rounded-none'
                icon={<GoChevronDown 
                    size={16}
                    className='text-c3'
                />}
               /> 
                {showmenu && (
                    <MessageMenu
                        self = {self}
                        setShowMenu={setShowMenu}
                        showMenu={showmenu}
                        deletePopupHandler = {deletePopupHandler}
                        text= {message.text ? message.text : null}
                    />
                )}
            </div>
        </div>
      </div>
      <div className={`flex items-end ${ self ? ' justify-start flex-row-reverse mr-12' : 'ml-12'}`}>
        <div className="text-xs text-c3">
            {formatDate(date)}
        </div>
      </div>
    </div>
  )
}

export default Message
