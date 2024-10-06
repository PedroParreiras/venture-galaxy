import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import getDoc

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  async function signup(email, password, userType) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Save additional user information to Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      userType: userType,
      email: email,
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Check if the user already exists in Firestore
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userDocRef); // Use getDoc from Firestore

    if (!userDoc.exists()) {
      // If the user does not exist in Firestore, save additional information
      await setDoc(userDocRef, {
        userType: 'googleUser', // Adjust userType as needed
        email: result.user.email,
      });
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    // Other auth-related functions
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
