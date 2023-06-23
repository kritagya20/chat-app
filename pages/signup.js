import Link from 'next/link'; //links for navigation
import React, { useEffect } from 'react';
import { IoLogoGoogle } from 'react-icons/io'; // Importing icons
import { useRouter } from 'next/router'; //router for updating and locking the url
import { useAuth } from '@/context/authContext'; //Custom hook for accessing the UserContext
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase'; //accessing the firebase database after authenticaiton
import { doc, setDoc } from 'firebase/firestore'; // fuction for creating the object in the firebase database
import { profileColors } from '@/utils/constants'; //set of different colors for user profiling

const gProvider = new GoogleAuthProvider();

const Signup = () => {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // If user is logged in, redirect to home page
      router.push('/');
    }
  }, [currentUser, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const colorIndex = Math.floor(Math.random() * profileColors.length);

    try {
      // Create a new user with email and password
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Set user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        email,
        color: profileColors[colorIndex]
      });

      // Create a chat document for the user
      await setDoc(doc(db, 'userChats', user.uid), {});

      // Update user profile with display name
      await updateProfile(user, {
        displayName,
      });

      console.log(user);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Sign in with Google using a popup
      await signInWithPopup(auth, gProvider);
    } catch (error) {
      console.error(error);
    }
  }

  return isLoading || (!isLoading && currentUser) ? 'Loader...' : (
    <div className='h-[100vh] flex justify-center items-center bg-c1'>
      <div className='flex items-center flex-col'>
        <div className='text-center'>
          <div className='text-4xl font-bold'>
            Create New Account
          </div>
          <div className='mt-3 text-c3'>
            Connect and chat with anyone, anywhere
          </div>
        </div>

        {/* Buttons for Google and Facebook Logins */}
        <div className='flex items-center justify-center w-full mt-10 mb-5'>
          {/* Google Login Button */}
          <div
            className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]'
            onClick={signInWithGoogle}
          >
            <div className='flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md'>
              <IoLogoGoogle size={24} />
              <span>Sign Up with Google</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <span className='w-5 h-[1px] bg-c3'></span>
          <span className='text-c3 font-semibold'>OR</span>
          <span className='w-5 h-[1px] bg-c3'></span>
        </div>

        {/* Form for email and password */}
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-3 w-[500px] mt-5'>
          {/* Name-field */}
          <input
            type='text'
            placeholder='Display Name'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />

          {/* Email-field */}
          <input
            type='email'
            placeholder='Email'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />

          {/* Password-field */}
          <input
            type='password'
            placeholder='Password'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />

          {/* Submit Button */}
          <button className='mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>
            Sign Up
          </button>
        </form>

        <div className='flex justify-center gap-1 text-c3 mt-5'>
          <span> Already Have an Account? </span>
          <Link
            href='/login'
            className='font-semibold text-white underline underline-offset-2 cursor-pointer'
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
