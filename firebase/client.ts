import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp,getApp, getApps } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm0w7Vpu_8Nkj4VH6FMs9UKdLZA14Xh20",
  authDomain: "prepwise-mockinterviewplatform.firebaseapp.com",
  projectId: "prepwise-mockinterviewplatform",
  storageBucket: "prepwise-mockinterviewplatform.firebasestorage.app",
  messagingSenderId: "885263948434",
  appId: "1:885263948434:web:51663f8351253f0bf4a44b",
  measurementId: "G-HHZNLFN9ZL"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app)