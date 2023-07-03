import Link from "next/link"; //link for navigation
import React, { useState, useEffect } from "react";
import { IoLogoGoogle } from "react-icons/io"; // Importing icons
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth"; //authentication using google apis
import { auth } from "@/firbase/firebase"; //authentication from firebase
import { useAuth } from "@/context/authContext"; //Custom hook for accessing the UserContext
import { useRouter } from "next/router"; //router for updating and locking the url
import ToastMessage from "@/components/ToastMessage"; //toast messages for specification of UI of messsages
import { toast } from "react-toastify"; //toast messages for pop ups
import Loader from "@/components/Loader";
import Developer from "@/components/Developer";

//instance of the googleAuthProvider
const gProvider = new GoogleAuthProvider();

const Login = () => {
  //router for locking the url
  const router = useRouter();

  //destructuring the useAuth object that is defined and exported from authContext.js
  const { currentUser, isLoading } = useAuth();

  //getting the value of email field to process the forget password working logic
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isLoading && currentUser) {
      // If user is logged in, redirect to home page
      router.push("/");
    }
  }, [currentUser, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;    

    try {    
      // Show toast message while resetting the signing in
      toast.promise(
        async () => {
        // Sign in with email and password
        await signInWithEmailAndPassword(auth, email, password);
        },
        {
          //different messages for different states of promise
          pending: "Signing In",
          success: "Sign In Successful",
          error: "Sign In Failed! Please check your account credentials",
        },
        {
          // duration of toast message in miliseconds
          autoClose: 5000,
        }
      );   

    
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

  const resetPassword = async () => {
    try {
      // Show toast message while resetting the password
      toast.promise(
        async () => {
          // Logic to reset the password
          await sendPasswordResetEmail(auth, email);
        },
        {
          //different messages for different states of promise
          pending: "Generating reset link",
          success: "Reset link sent to your registered email id",
          error: "You may have entered the wrong email id!",
        },
        {
          // duration of toast message in miliseconds
          autoClose: 5000,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return isLoading || (!isLoading && currentUser) ? (
    <Loader />
  ) : (
    <div className="min-h-[100vh] flex justify-center items-center bg-black">
      <ToastMessage />
      <div className="flex items-center flex-col">
        <div className="text-center">
          <div className="text-3xl font-bold">Login to your Account</div>
          <div className="mt-1 text-c3">
            Desktop Chat Application
          </div>
        </div>

        {/* Buttons for Google and Facebook Logins */}
        <div className="flex justify-center items-center w-full mt-4 mb-2">
          {/* Google Login Button */}
          <div
            onClick={signInWithGoogle}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]"
          >
            <div className="flex items-center justify-center gap-3 text-black font-semibold bg-transparent w-full h-full rounded-md">
              <IoLogoGoogle size={24} />
              <span>Login with Google</span>
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
          className="flex flex-col items-center gap-2 w-[500px] mt-5"
        >
          {/* Email-field */}
          <input
            type="email"
            placeholder="Email"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-whtie"
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password-field */}
          <input
            type="password"
            placeholder="Password"
            className={`w-full h-14 bg-c5 outline-none rounded-xl px-5 text-whtie border-none`}
            autoComplete="off"
          />

          {/* Forgot Password Link */}
          <div className="text-right w-full text-c3 text-sm">
            <span className="cursor-pointer hover:underline" onClick={resetPassword}>
              Forgot Password
            </span>
          </div>

          {/* Submit Button */}
          <button 
            className="mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-blue-800"
          >
            Log In
          </button>
        </form>

        <div className="flex justify-center gap-2 text-sm text-c3 mt-5">
          <span>New User?</span>
          <Link
            href="/signup"
            className="font-semibold text-white underline underline-offset-2 cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </div>
      < Developer left="true"/>
    </div>
  );
};

export default Login;
