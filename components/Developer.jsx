import React from 'react'
import { GoCodeReview } from 'react-icons/go'
import Icon from './Icon'
import { global } from 'styled-jsx/css'

const Developer = ({left}) => {
  return (
    <div className={`absolute bottom-1 text-xs font-normal w-full flex gap-1 opacity-70 ${left ? 'left-0' : 'justify-center items-center'}`}>
      Developed by 
        <a 
            title='Kritagya Singh Chouhan'
            className='capitalize bg-transparent text-c4' 
            href="https://kritagya.in/"> 
            kritagya singh chouhan 
        </a>
        <GoCodeReview
            size={14}
            className='text-c4'
        />
    </div>
  )
}

export default Developer
