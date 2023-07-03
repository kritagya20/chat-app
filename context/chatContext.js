import React, { useReducer } from 'react';
import { createContext, useContext, useState } from 'react';
import { useAuth } from './authContext';


const chatContext = createContext();
export const ChatContextProvider = ({children}) => {
    const [users, setUsers] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    //states for input messages
    const [inputText, setInputText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [isTyping, setIsTyping] = useState(null);
    const [imageViewer, setImageViewer] = useState(null);

    const {currentUser} = useAuth();

    // Initial state for the chat functionality
    const INITIAL_STATE = {
        chatId: "",
        user: null
    };

    // Reducer function for managing state updates
    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                return {
                    user: action.payload, // Store the user information of the new user selected for chat
                    chatId: currentUser?.uid > action?.payload?.uid
                            ? currentUser?.uid + action?.payload?.uid
                            : action?.payload?.uid + currentUser?.uid // Generate a unique chat ID for the chat
                };
            case "EMPTY":
                return INITIAL_STATE;

            default:
                return state;
        }
    };

    // Initialize state and dispatch function using the chatReducer
    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <chatContext.Provider value= {{
            users,
            setUsers,
            data: state,
            dispatch,
            chats, setChats,
            selectedChat, setSelectedChat,
            inputText, setInputText,
            attachment, setAttachment,
            attachmentPreview, setAttachmentPreview,
            isTyping, setIsTyping,
            imageViewer, setImageViewer 
        }}>
            {children}
        </chatContext.Provider>
    )
}


export const useChatContext = () => useContext(chatContext);