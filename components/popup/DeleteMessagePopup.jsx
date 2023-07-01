import React from 'react'
import PopupWrapper from './PopupWrapper'
import { useAuth } from '@/context/authContext'
import { useChatContext } from '@/context/chatContext'
import { RiErrorWarningLine } from 'react-icons/ri'
import { DELETED_FOR_ME, DELETED_FOR_EVERYONE } from '@/utils/constants'


const DeleteMessagePopup = (props) => {
  
  const {currentUser} = useAuth();
  const {users, dispatch} = useChatContext();


  return (
    <PopupWrapper {...props} >
      <div className='mt-6 mb-2 '>
        <div className="flex items-center justify-center gap-2">
            <RiErrorWarningLine 
                size={24}
                className='text-red-500'
            />
            <div className="text-lg">Are you sure, you want to delete the message ?</div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-10">

          {props.self && (
            <button 
              onClick={()=> props.deleteMessage(DELETED_FOR_ME)}
              className=" uppercase  text-sm border-red-700 px-2 py-2 rounded-md text-red-500 border-[2px]  hover:bg-red-700 hover:text-white"
            >
              Delete for me
            </button>
          )}
          <button 
            onClick={()=> props.deleteMessage(DELETED_FOR_EVERYONE)}
            className=" uppercase  text-sm border-red-700 px-2 py-2 rounded-md text-red-500 border-[2px]  hover:bg-red-700 hover:text-white"
          > Delete for EveryOne
          </button>

          <button 
            onClick={props.onHide}
            className= "uppercase text-sm border-white px-2 py-2 rounded-md text-white  border-[2px]  hover:bg-white hover:text-black"
          >
            Cancel
          </button>
        </div>

      </div>
    </PopupWrapper>
  );
}

export default DeleteMessagePopup;
