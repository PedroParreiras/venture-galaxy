// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAsQETcccN6H4UTzWFd_x9mLYriDs5YyHQ',
  authDomain: 'venture-galaxy.firebaseapp.com',
  projectId: 'venture-galaxy',
  storageBucket: 'venture-galaxy.appspot.com',
  messagingSenderId: '767580138374',
  appId: '1:767580138374:web:e0261459e0d5d0a5281a07',
  measurementId: "G-L8GJ5219HL"
};

const app = initializeApp(firebaseConfig);

// Inicialize os serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
