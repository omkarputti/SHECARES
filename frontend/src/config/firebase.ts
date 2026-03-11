// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyBUaDzelmZoluTFRV_gK8MhvI1wAyq-KZU",
//   authDomain: "davangere-a4f63.firebaseapp.com",
//   projectId: "davangere-a4f63",
//   storageBucket: "davangere-a4f63.firebasestorage.app",
//   messagingSenderId: "556847330974",
//   appId: "1:556847330974:web:013b694c45a3571d5b6d8f",
//   measurementId: "G-G9SX1GCKNG"
// };

// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export default app;
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUaDzelmZoluTFRV_gK8MhvI1wAyq-KZU",
  authDomain: "davangere-a4f63.firebaseapp.com",
  projectId: "davangere-a4f63",
  storageBucket: "davangere-a4f63.firebasestorage.app",
  messagingSenderId: "556847330974",
  appId: "1:556847330974:web:013b694c45a3571d5b6d8f",
  measurementId: "G-G9SX1GCKNG"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
export const auth = getAuth(app);

// Set auth persistence (faster subsequent loads)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence (optional but recommended)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in first tab only');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support persistence');
  }
});

export default app;