import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console -> Project Settings -> General
const firebaseConfig = {
  apiKey: "AIzaSyBuWs5KlrOa0qWg7lCpJEinzh4kxYqQC38",
  authDomain: "visual-diagram-builder-fae72.firebaseapp.com",
  projectId: "visual-diagram-builder-fae72",
  storageBucket: "visual-diagram-builder-fae72.firebasestorage.app",
  messagingSenderId: "853230771030",
  appId: "1:853230771030:web:0210f0b17403b6b39614f7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
