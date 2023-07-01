import React, { useEffect, useRef, useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import copy from "copy-to-clipboard";
import { useChatContext } from '@/context/chatContext';
import { toast } from 'react-toastify';
import ToastMessage from './ToastMessage';


const MessageMenu = ({setShowMenu, showMenu, self, deletePopupHandler, text}) => {


  const handleCopyMessage = async () => {
    try {
      // Show toast message while cpying the message
      toast.promise(
        async () => {
          await copy(text);
        },
        {
          //different messages for different states of promise
          pending: "Copying Message",
          success: "Message Copied",
          error: "Failed to Copy the Message",
        },
        {
          // duration of toast message in miliseconds
          autoClose: 750,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };



  //removing menu when clicked somewhere else in the application
  const handleClickAway = () => {
    setShowMenu(false);
  };

  const ref = useRef();

  useEffect(()=> {
  }, [showMenu]);

  return (
    <>
    <ToastMessage />
    <ClickAwayListener onClickAway={handleClickAway}>
      <div ref={ref} className={`w-[125px] absolute bg-c0 z-10 rounded-md overflow-hidden top-8 ${self ? 'right-0' : 'left-0'}`}>
        <ul className="flex flex-col py-1">
          <li 
            onClick={()=>{deletePopupHandler(true)}}
            className="flex items-center py-2 px-3 text-xs hover:bg-black cursor-pointer"
          >
            Delete Message
          </li>
          { text && (
            <li 
              onClick={handleCopyMessage}
              className="flex items-center py-2 px-3 text-xs hover:bg-black cursor-pointer"
            >
              Copy Message
            </li>
          )}
        </ul>
    </div>

    </ClickAwayListener>
    </>
  )
}

export default MessageMenu
