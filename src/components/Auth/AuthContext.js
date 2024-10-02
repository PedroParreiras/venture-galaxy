// src/contexts/AuthContext.js
import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth, db } from '../firebase'; // Assegure-se de que o Firebase está configurado corretamente
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função para login
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Função para logout
    const logout = () => {
        return signOut(auth);
    };

    // Função para resetar senha
    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data());
                    } else {
                        setUserData(null);
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        login,
        logout,
        resetPassword, // Adiciona a função de resetar senha
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
