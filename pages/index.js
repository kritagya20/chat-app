import React, { useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import LeftNav from "@/components/LeftNav";

const Home = () => {
  const router = useRouter();

  //destructuring the useAuth object that is defined and exported from authContext.js
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading]);

  return !currentUser ? (
    <Loader />
  ) : (
    <div className="bg-c1 flex h-[100vh]">
      <div className="flex w-full">
        <LeftNav />
        <div className="flex bg-c2 grow">
          {/* Sidebar */}
          <div>Sidebar</div>

          {/* Chat */}
          <div>Chat</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
