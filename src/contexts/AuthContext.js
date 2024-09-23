// src/contexts/AuthContext.js
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
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  async function signup(email, password, userType) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Salvar informações adicionais no Firestore
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

    // Verificar se o usuário já existe no Firestore
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists()) {
      // Se o usuário não existir no Firestore, salve as informações adicionais
      await setDoc(userDocRef, {
        userType: 'googleUser', // Você pode ajustar isso conforme necessário
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
    // Outras funções de autenticação
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
