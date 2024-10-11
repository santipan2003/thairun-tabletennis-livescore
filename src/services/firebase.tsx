// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_C9tsfpPXMDWga2j9zOxfbKB8Nt8xZzo",
  authDomain: "thairun-table-tennis.firebaseapp.com",
  projectId: "thairun-table-tennis",
  storageBucket: "thairun-table-tennis.appspot.com",
  messagingSenderId: "709749094210",
  appId: "1:709749094210:web:dec85b75fc35b59227badb",
  measurementId: "G-CS2GBQV2CZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;
