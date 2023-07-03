import React, { useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import LeftNav from "@/components/LeftNav";
import Chats from "@/components/Chats";
import Chat from "@/components/Chat";
import { useChatContext } from "@/context/chatContext";
import { global } from "styled-jsx/css";

const Home = () => {
  const router = useRouter();

  //destructuring the useAuth object that is defined and exported from authContext.js
  const { currentUser, isLoading } = useAuth();

  const {data} = useChatContext();

  //state to switch to login page when user has logged out
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading]);

  return !currentUser ? (
    <Loader />
  ) : (
    <div className="primary flex h-[100vh]">
      <div className="flex w-full">
        <LeftNav />
        <div className="flex bg-c2 grow">
          {/* Sidebar */}
          <div className="w-[400px] p-2 overflow-auto scrollbar shrink-0 border-r border-white/[0.05] ">
            <div className="flex flex-col h-full"> 
              <Chats />
            </div>
          </div>

          {/* Chat */}
          {data.user && <Chat />}
        </div>
      </div>
    </div>
  );
};

export default Home;
