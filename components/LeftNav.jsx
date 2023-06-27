import React, { useState } from 'react';
import { useAuth } from '@/context/authContext';
import {BiCheck, BiEdit} from 'react-icons/bi';
import {FiPlus} from 'react-icons/fi';
import {IoClose, IoLogOutOutline} from 'react-icons/io5';
import {MdPhotoCamera, MdAddAPhoto, MdDeleteForever} from 'react-icons/md';
import Avatar from './Avatar';
import Icon from './Icon';
import { BsFillCheckCircleFill } from "react-icons/bs"
import { profileColors } from '@/utils/constants';
import { toast } from 'react-toastify';
import ToastMessage from './ToastMessage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth, storage } from '@/firbase/firebase';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';



const LeftNav = () => {   
  
  const {currentUser, signOut, setCurrentUser} = useAuth();

  //state for expanding and shrinking the navbar
  const [editProfile, setEditProfile] = useState(false);

  //state for storing the edited name by the user
  const [nameEdited, setNameEdited] = useState(false);

  //taking the value from the authenticated object for future updation
  const authUser = auth.currentUser;

  const uploadImageToFirestore = (file) => {
    try {
      if(file) {
        // file uploading logic
        const storageRef = ref(storage, currentUser.displayName);
        const uploadTask = uploadBytesResumable(storageRef, file);

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
              console.log('File available at', downloadURL);

              //updating the user object 
              handleUpdateProfile("photo", downloadURL);

              //upating the user authentication profile
              await updateProfile(authUser, {
                photoURL: downloadURL,
              });
            });
          }
        );
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  //function to update the local state and firebase object for any kind of updates performed by user in user profile
  const handleUpdateProfile = (type, value) => { //possible values of type =  color, name, photo, photo-remove
    
    //creating the shallow copy of object using spread operator
    let obj = { ...currentUser}
    
    switch(type) {
      case "color": 
        obj.color = value;
        break;
      case "name": 
        obj.displayName = value;
        break;
      case "photo": 
        obj.photoURL = value;
        break;
      case "photo-remove": 
        obj.photoURL = null;
        break;
      default: 
        break;
    }

    try {
      // Show toast message while perfoming the changes of user profile
      toast.promise(
        async () => {
          
          //gettting the user data that is needed to update from firebase
          const userDocRef = doc(db, "users", currentUser.uid);
          
          //updating the user data on firebase  
          await updateDoc(userDocRef, obj); //updateDoc is a firebase function to update data. Its first parameter is refrence of the object that will be updated, while second is the actual change that need to be update in the specific object
        
          //updating the user information in the local state
          setCurrentUser(obj);

          //updating the authentication profile for photo remove function
          if(type === "photo-remove") {
            await updateProfile(authUser, {
              photoURL: null
            });
          }

          //updating the authentication profile for name
          if(type === "name") {
            await updateProfile(authUser, {
              displayName: value
            });
            setNameEdited(false); //setting the setNameEdited state as false to display edit icon instead of check mark
          }
        
        },
        {
          //different messages for different states of promise
          pending: "Updating Profile",
          success: "Profile Updated Successfully",
          error: "Profile Update Failed",
        },
        {
          // duration of toast message in miliseconds
          autoClose: 3000,
        }
      );
    } catch (error) {
      console.error(error);
    }
  }


  const onkeydown = (e) => {
    //avoiding the line break when user hits the enter button
    if(e.key === "Enter" && e.keyCode === 13 ) {
      e.preventDefault ();
    }
  }

  const onkeyup = (e) => {
    if(e.target.innerText.trim() !== currentUser.displayName ) {
      //name is edited
      setNameEdited(true);
    } else {
      // name is not edited
      setNameEdited(false);
    }
  }

  const editProfileContainer = () => {
    return (
      <div className="relative flex flex-col items-center">
        <ToastMessage />
        <Icon 
          size="small" 
          className="absolute top-0 right-5 hover:bg-c2"
          icon={<IoClose size={20}/>} 
          onClick={() => setEditProfile(false)} 
        />

        <div className='relative group cursor-pointer'>
          <Avatar 
            size="xx-large" 
            user={currentUser}
          /> 

          {/* Displaying the change display Picture or update Display Picture with file uplaod feature */}
          <div className='w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex'>
            <label htmlFor='fileUpload'>
              { currentUser.photoURL ? (<MdPhotoCamera size= {34} />) : (<MdAddAPhoto size= {34} />) }
            </label>
            <input 
              id='fileUpload'
              type="file"
              onChange={(e) => uploadImageToFirestore(e.target.files[0])}  
              style={{display: 'none'}}
            />
          </div>

          {/* Displaying Delete icon when display picture of the user is set */}
          { currentUser.photoURL && 
            <div className='w-6 h-6 rounded-full bg-red-500 flex justify-center items-center absolute right-0 bottom-0' onClick={() => {
              handleUpdateProfile("photo-remove")
            }}>
              <MdDeleteForever size={14} />
            </div>
          }
        </div>

        {/* Displaying the Name and Email of the user with allowing the user to edit the name */}
        <div className='mt-5 flex flex-col items-center'>
          <div className='flex items-center gap-2'>
            
            {!nameEdited && <BiEdit  className='text-c3'/>}
            {nameEdited && 
              <BsFillCheckCircleFill  
                className='text-c4 cursor-pointer'
                onClick= {() => { 
                  handleUpdateProfile("name", document.getElementById('displayNameEdit').innerText);
                }}
              />
              }

            <div 
              contentEditable
              className='bg-transparent outline-none border-none text-center'
              id='displayNameEdit'
              onKeyUp={onkeyup}
              onKeyDown={onkeydown}
            >
              {currentUser.displayName}
            </div> 
          </div>
          <span className='text-c3 text-sm'>
            {currentUser.email}
          </span>
        </div>

        {/* Displaying the color layout for different  dp colors using map on profileColor Array */}
        <div className='grid grid-cols-5 gap-4 mt-5'>
              {profileColors.map((color, index) => (
                <span 
                  key={index}
                  className='w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125'
                  style={{backgroundColor: color}}
                  onClick={() => {
                    handleUpdateProfile("color", color);
                  }}
                >
                  {/* providing the check icon to only present color of the user */}
                  {color === currentUser.color && (
                    <BiCheck />
                  )}
                </span>
              ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${editProfile ? "w-[350px]" : "w-[80px] items-center"} flex flex-col justify-between py-5 shrink-0 transition-all`}>
      {editProfile ? editProfileContainer() : (
        <div className='relative group cursor-pointer' onClick={() => setEditProfile(true)}>
          <Avatar size="large" user={currentUser}/> 
          <div className='w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex'>
            <BiEdit size={14} />
          </div>
        </div>
      )}


      <div className={`flex gap-5 ${editProfile ? "ml-5" : "flex-col items-center"}`}>
        <span> 
          <Icon 
            size="x-large" 
            className={"bg-green-500 hover:bg-gray-600"} 
            icon={<FiPlus size={24}/>} 
            onclick={()=>{}}
          />
        </span>
        <span> 
          <Icon 
            size="x-large" 
            className={" hover:bg-c2"} 
            icon={<IoLogOutOutline 
            size={24}/>} 
            onClick={signOut} 
          />
        </span>

      </div>
    </div>
  );
}

export default LeftNav;
