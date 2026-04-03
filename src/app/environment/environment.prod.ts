import { initializeApp } from "firebase/app";

export const environment = {
    production: true,
    apiUrl: 'http://localhost:8080' // URL para desarrollo
  };


  export const firebaseConfig = {
    apiKey: "AIzaSyCum4h1x8KW2Fse63QY8p2Mj00Tb8r2u4A",
    authDomain: "finanzas-pro-b27fd.firebaseapp.com",
    projectId: "finanzas-pro-b27fd",
    storageBucket: "finanzas-pro-b27fd.firebasestorage.app",
    messagingSenderId: "459657386272",
    appId: "1:459657386272:web:58118490ae1b864a56df45",
    measurementId: "G-B1W191VQ1D"
  };

  export const app = initializeApp(firebaseConfig);