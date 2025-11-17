// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCadDsdEYUdIUzl9mz4dTE7qd00BAmDJw8",
  authDomain: "simposium-cei-2026.firebaseapp.com",
  projectId: "simposium-cei-2026",
  storageBucket: "simposium-cei-2026.firebasestorage.app",
  messagingSenderId: "1062477813170",
  appId: "1:1062477813170:web:24ab60a2fb63af6b0d00ab"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta auth y db para usar en tu app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

