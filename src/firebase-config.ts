// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlP5nYa2qJ1vWE9E9HaS_XSnrPUfPCQbw",
  authDomain: "text-editor-project-324a0.firebaseapp.com",
  projectId: "text-editor-project-324a0",
  storageBucket: "text-editor-project-324a0.firebasestorage.app",
  messagingSenderId: "168310269335",
  appId: "1:168310269335:web:f64c97d95119be81ab10d2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
