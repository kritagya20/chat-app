// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// crucial data from firebase with project specifications
const firebaseConfig = {
  apiKey: "AIzaSyAk-aqt_1AmtNp1gc1HgDd0T65Fs-OCtW4",
  authDomain: "chat-app-d9545.firebaseapp.com",
  projectId: "chat-app-d9545",
  storageBucket: "chat-app-d9545.appspot.com",
  messagingSenderId: "733463292916",
  appId: "1:733463292916:web:df425dbc7ad678b11ca7a1",
};

const app = initializeApp(firebaseConfig); //intiallising app

//exporting the services initialised
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
