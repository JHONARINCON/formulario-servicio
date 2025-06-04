// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaJ7lhGoCTq9a4cmL5P31b9RbF31QaNnE",
  authDomain: "ordenes-servicio-a8209.firebaseapp.com",
  projectId: "ordenes-servicio-a8209",
  storageBucket: "ordenes-servicio-a8209.appspot.com",
  messagingSenderId: "480144746551",
  appId: "1:480144746551:web:28787185ca77baa50737b2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore Lite y exportar
export const db = getFirestore(app);
