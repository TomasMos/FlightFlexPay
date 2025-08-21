import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfqZn0_o-iKPjjh09gzEZ_i2MS3zQvofM",
  authDomain: "splickets.firebaseapp.com",
  projectId: "splickets",
  storageBucket: "splickets.firebasestorage.app",
  messagingSenderId: "1025283941420",
  appId: "1:1025283941420:web:86ea69af2aa00e54cb9d89",
  measurementId: "G-2DN48VSRV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' && import.meta.env.PROD 
  ? getAnalytics(app) 
  : null;

export default app;