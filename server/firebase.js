// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuy6Ma_f4uHQFiM2N_SyJnD7_k7eE4Mdo",
  authDomain: "se3316-lab4-936a7.firebaseapp.com",
  projectId: "se3316-lab4-936a7",
  storageBucket: "se3316-lab4-936a7.firebasestorage.app",
  messagingSenderId: "694963918772",
  appId: "1:694963918772:web:05fcb52986a774ac2184e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = firebase.firestore();
