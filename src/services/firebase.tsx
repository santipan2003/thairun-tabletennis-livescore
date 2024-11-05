// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAh8qB2ANAOU6F8UZgunS_hCHWxZYMiG0M",
  authDomain: "pingpong-thairun-sv2.firebaseapp.com",
  projectId: "pingpong-thairun-sv2",
  storageBucket: "pingpong-thairun-sv2.firebasestorage.app",
  messagingSenderId: "1097067801646",
  appId: "1:1097067801646:web:b6a71759abcf56f91403bf",
  measurementId: "G-DC79YR9LQ7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;
