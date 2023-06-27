import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, signOut as authSignOut } from "firebase/auth";
import { auth, db } from '@/firbase/firebase'; //accessing the firebase database after authenticaiton
import { doc, getDoc } from "firebase/firestore";


// Create a new context using createContext
const UserContext = createContext();

// Export the UserProvider component
export const UserProvider = ({ children }) => {
  // Define state variables using useState
  const [currentUser, setCurrentUser] = useState(null); // Current user state
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Function to clear the current user state and set loading to false
  const clear = () => {
    setCurrentUser(null);
    setIsLoading(false);
  };

  // Function to handle changes in authentication state
  const authStateChanged = async (user) => {
    setIsLoading(true);
    if (!user) {
      clear();
      return;
    }

    //accessing the user data from the firestore database
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    //setting the data of the present user that we had extracted from firestore. 
    setCurrentUser(userDoc.data()); //data() is used to remove additional methods and properties of the user object
    setIsLoading(false);
  };

  // Function to sign out the user
  const signOut = () => {
    authSignOut(auth).then(() => clear());
  };

  useEffect(() => {
    // Subscribe to the authentication state changes using onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  // Return the UserContext.Provider component
  return (
    <UserContext.Provider
      value={{
        currentUser, // Provide access to the current user state
        setCurrentUser, // Provide a function to update the current user state
        isLoading, // Provide access to the loading state
        setIsLoading, // Provide a function to update the loading state
        signOut, // Provide the signOut function
      }}
    >
      {children} {/* Render the children components */}
    </UserContext.Provider>
  );
};

// Custom hook for accessing the UserContext
export const useAuth = () => useContext(UserContext);
