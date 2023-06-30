import React, { useState } from 'react';
import {CgAttachment} from "react-icons/cg"
import Icon from './Icon';
import {HiOutlineEmojiHappy} from 'react-icons/hi';
import Composebar from './Composebar';
import EmojiPicker from 'emoji-picker-react';
import ClickAwayListener from 'react-click-away-listener';


const ChatFooter = () => { 

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = () => {

    }

  return (
    <div className='flex items-center bg-c1/[0.5] p-2 rounded-xl relative'>
      <div className='shrink-0'>
        <input type="file"
            id='fileUploader'
            className='hidden'
            onChange={() => {}}
        />
        <label htmlFor="fileUploader">
            <Icon
                size="large"
                icon = {
                    <CgAttachment 
                        size={20}
                        className='text-c3'
                    />
                }
            />
        </label>
      </div>
      <div className="shrink-0 relative">
        <Icon
            onClick={() => setShowEmojiPicker(true)}
            size="large"
            icon = {
            <HiOutlineEmojiHappy 
                size={24}
                className='text-c3'
            />
            }
        />
        {showEmojiPicker && (
            <ClickAwayListener 
                onClickAway={() => setShowEmojiPicker(false)}
            >
                <div className="absolute bottom-12 left-0 shadow-lg">
                    <EmojiPicker 
                        emojiStyle='apple'
                        theme='light'
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch = {false}
                        width={300}
                        height={400}
                    />
                </div>
            </ClickAwayListener>

        )}
      </div>
      <Composebar />
    </div>
  )
}

export default ChatFooter
