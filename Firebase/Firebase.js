// firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgWmEmt2qYKWnRtBLt_TGjlTo0Gh2AZgQ",
  authDomain: "ai-restaruant-voice-coach.firebaseapp.com",
  projectId: "ai-restaruant-voice-coach",
  storageBucket: "ai-restaruant-voice-coach.firebasestorage.app",
  messagingSenderId: "498715783756",
  appId: "1:498715783756:web:3e7195c8a4efcc007e7ae9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export for use throughout your app
export { app, db, auth };
