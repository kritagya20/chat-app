import React from 'react';
import Image from 'next/image';


const Avatar = ({size, user, onClick}) => {

// Determine the value of 's' based on the 'size' variable
const s = size === "small" ? 32 : size === "medium" ? 36 : size === "large" ? 40 : size === "x-large" ? 48 : size === "xx-large" ? 86 : 30;

// Determine the CSS class value for 'c' based on the 'size' variable
const c = size === "small" ? "w-7 h-7" : size === "medium" ? "w-8 h-8" : size === "large" ? "w-9 h-9" : size === "x-large" ? "w-10 h-10" : "w-20 h-20";

// Determine the font class value for 'f' based on the 'size' variable
const f = size === "large" ? "text-xl" : size === "xx-large" ? "text-3xl" : "text-base";





  return (
    <div className={`${c} rounded-full flex items-center justify-center text-base shrink-0 relative`} style={{backgroundColor: user?.color}} onClick={onClick} >
      
      {/* Code to display the active (blue) icon when user is active */}
      {user?.isOnline && (
        <>
          {size === 'large' && (
            <span className='w-[7px] h-[7px] bg-blue-600  rounded-full absolute bottom-[2px] right-[2px]'></span>
          )}
          {size === 'x-large' && (
            <span className='w-[10px] h-[10px] bg-blue-600 rounded-full absolute bottom-[3px] right-[3px]'></span>
          )}
        </>
      )}


      {user?.photoURL ? ( 
        <div className={`${c} overflow-hidden rounded-full`}>
          <Image 
            src={user.photoURL}
            alt='user Avatar'
            width={s}
            height={s}
          />
        </div>
       ) : (
        <div className={`${f} uppercase font-semibold`}  >
            {user.displayName.charAt(0)}
        </div>
       )}
      
    </div>
  )
}

export default Avatar;
