import Link from "next/link"; //links for navigation
import React, { useEffect } from "react";
import { IoLogoGoogle } from "react-icons/io"; // Importing icons
import { useRouter } from "next/router"; //router for updating and locking the url
import { useAuth } from "@/context/authContext"; //Custom hook for accessing the UserContext
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/firbase/firebase"; //accessing the firebase database after authenticaiton
import { doc, setDoc } from "firebase/firestore"; // fuction for creating the object in the firebase database
import { profileColors } from "@/utils/constants"; //set of different colors for user profiling
import Loader from "@/components/Loader";

//instance of the googleAuthProvider
const gProvider = new GoogleAuthProvider();

const Signup = () => {
  //router for locking the url
  const router = useRouter();

  //destructuring the useAuth object that is defined and exported from authContext.js
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // If user is logged in, redirect to home page
      router.push("/");
    }
  }, [currentUser, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //getting the values from the form
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    //setting color index to choose random colors from the array
    const colorIndex = Math.floor(Math.random() * profileColors.length);

    try {
      // Create a new user with email and password
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user data in Firestore for profiling
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email,
        color: profileColors[colorIndex],
      });

      // Create userChats data in Firestore for chats
      await setDoc(doc(db, "userChats", user.uid), {});

      // Update user profile with display name in the Firestore object
      await updateProfile(user, {
        displayName,
      });

      console.log(user);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Sign in with Google using a popup
      await signInWithPopup(auth, gProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return isLoading || (!isLoading && currentUser) ? (
    <Loader />
  ) : (
    <div className="py-4 min-h-[100vh] flex justify-center items-center bg-black">
      <div className="flex items-center flex-col">
        <div className="text-center">
          <div className="text-3xl font-bold">Create New Account</div>
          <div className="mt-1 text-c3">
          Desktop Chat Application
          </div>
        </div>

        {/* Buttons for Google and Facebook Logins */}
        <div className="flex items-center justify-center w-full mt-5 mb-2">
          {/* Google Login Button */}
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-14 rounded-md cursor-pointer px-4 py-[2px]"
            onClick={signInWithGoogle}
          >
            <div className="flex items-center justify-center gap-3 text-black font-semibold w-full h-full rounded-md">
              <IoLogoGoogle size={24} />
              <span>Sign Up with Google</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-5 h-[1px] bg-c3"></span>
          <span className="text-c3 font-semibold">OR</span>
          <span className="w-5 h-[1px] bg-c3"></span>
        </div>

        {/* Form for email and password */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3 min-w-[320px] w-[50vw] max-w-[500px] mt-5"
        >
          {/* Name-field */}
          <input
            type="text"
            placeholder="Display Name"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-whtie"
            autoComplete="off"
          />

          {/* Email-field */}
          <input
            type="email"
            placeholder="Email"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-whtie"
            autoComplete="off"
          />

          {/* Password-field */}
          <input
            type="password"
            placeholder="Password"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-whtie"
            autoComplete="off"
          />

          {/* Submit Button */}
          <button className="mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-blue-800">
            Sign Up
          </button>
        </form>

        <div className="flex justify-center gap-2 text-sm text-c3 mt-5">
          <span> Already Have an Account? </span>
          <Link
            href="/login"
            className="font-semibold text-white underline underline-offset-2 cursor-pointer"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
