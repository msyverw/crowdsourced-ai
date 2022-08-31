// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDunWQTd9I2yBjdyn3FdEIu8O7gpXCB2Cs",
    authDomain: "crowdsourced-ai.firebaseapp.com",
    projectId: "crowdsourced-ai",
    storageBucket: "crowdsourced-ai.appspot.com",
    messagingSenderId: "467639895096",
    appId: "1:467639895096:web:54e8021c076a260b47d2cd",
    measurementId: "G-HGHH3H471Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase();
