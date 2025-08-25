import { initializeApp } from "firebase/app";

export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080' // URL para desarrollo
  };

  export const firebaseConfig = {
    apiKey: "AIzaSyBOTuprHiPJtm4fbIzFTJD2uVrn-VsuY88",
    authDomain: "finanzas-dev-85afd.firebaseapp.com",
    projectId: "finanzas-dev-85afd",
    storageBucket: "finanzas-dev-85afd.firebasestorage.app",
    messagingSenderId: "6860631227",
    appId: "1:6860631227:web:d06b2be8ac0329dcc24d9e"
  };

  export const app = initializeApp(firebaseConfig);