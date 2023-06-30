import { useChatContext } from '@/context/chatContext';
import React from 'react'
  import {TbSend } from 'react-icons/tb'

const Composebar = () => {

  const { inputText, setInputText, setAttachment, attachmentPreview, setAttachmentPreview} = useChatContext();

  const handleTyping = (e) => {
    setInputText(e.target.value);
  }

  const onkeyup = (e) => {
    if(e.key === 'Enter' && inputText) {
      handleSend();
    }
  }

  const handleSend = () => {

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
        className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center ${inputText.trim().length >0 ? 'bg-c4': '' }`}
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
