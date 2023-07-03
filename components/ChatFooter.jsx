import React, { useState } from 'react';
import {CgAttachment} from "react-icons/cg"
import Icon from './Icon';
import {HiOutlineEmojiHappy} from 'react-icons/hi';
import Composebar from './Composebar';
import EmojiPicker from 'emoji-picker-react';
import ClickAwayListener from 'react-click-away-listener';
import { useChatContext } from '@/context/chatContext';
import { MdDeleteForever } from 'react-icons/md';


const ChatFooter = () => { 

    const {data, isTyping, inputText, setInputText, setAttachment, attachmentPreview, setAttachmentPreview} = useChatContext();

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    //function to enter the selected emoji into the input message
    const onEmojiClick = (emojiData) => {

        let text = inputText; //accessing the previous value of input text
        setInputText((text += emojiData.emoji)); //concating the emoji in the input message
    }

    const onFileChange = (e) => {
        const file = e.target.files[0];
        setAttachment(file);

        if(file) {
            //URL api is used for generating the URL for our file
            const blobUrl = URL.createObjectURL(file);
            setAttachmentPreview(blobUrl); //passing the url for preview of out files
        }
    }

  return (
    <div className=' flex items-center gap-1  p-2 rounded-sm relative border-t border-white/[0.5]'>
        {attachmentPreview && 
            <div className="absolute w-[120px] h-[120px] bottom-16 left-0 p-2 rounded-md overscroll-x-contain bg-c1 ">
                <div className="w-[100px] h-[100px] rounded-sm overflow-hidden">
                    <img src={attachmentPreview} />
                </div>
                <div className="w-6 h-6 flex items-center justify-center cursor-pointer rounded-full bg-red-500 absolute -right-2 -top-2">
                    <MdDeleteForever  
                        onClick={() => {
                            setAttachment(null);
                            setAttachmentPreview(null);
                        }}
                        size={14}
                    />
                </div>
            </div>
        }
      <div className='shrink-0'>
        <input type="file"
            id='fileUploader'
            className='hidden'
            onChange={onFileChange}
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
      { isTyping && (
            <div className="absolute -top-6 left-4 bg-c2 w-full h-6">
              <div className="flex gap-2 w-full h-full opacity-50 text-sm text-white">
                  {`${data?.user?.displayName} Is typing`}
                  <img src='/typing.svg' />
              </div>
            </div>
      )}

      <Composebar />
    </div>
  )
}

export default ChatFooter
