import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIbRq-e-nPYD16lO_WuY3SCOnH_mjO_dg",
  authDomain: "shecares-2c973.firebaseapp.com",
  projectId: "shecares-2c973",
  storageBucket: "shecares-2c973.firebasestorage.app",
  messagingSenderId: "390312224528",
  appId: "1:390312224528:web:ec6c0dbf298b19dc802795",
  measurementId: "G-ZZ46RQJV73",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
