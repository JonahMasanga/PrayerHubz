import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZhcfTgt1KgIlPoS-pHDk6-qpLkZkXiTo",
  authDomain: "prayer-hub-d99b2.firebaseapp.com",
  projectId: "prayer-hub-d99b2",
  storageBucket: "prayer-hub-d99b2.firebasestorage.app",
  messagingSenderId: "417830667458",
  appId: "1:417830667458:web:061af540cf7d050478675b",
  measurementId: "G-HWSB3CKCH1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
