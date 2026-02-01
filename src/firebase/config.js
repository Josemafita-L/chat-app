import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCbMS69mi1s9mCaCDoYJ2kgI33kPOH1qKc",
  authDomain: "chatapp-27e87.firebaseapp.com",
  projectId: "chatapp-27e87",
  messagingSenderId: "1005533251073",
  appId: "1:1005533251073:web:8749f1c18353ff3a5fe200"
};

// Initialize Firebase WITHOUT Storage
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log("✅ Firebase initialized (without Storage)");