// Import necessary Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM1tSOHVaorTbCH1iiADdbZBuIxtqJCbk",
  authDomain: "klasbeheer.firebaseapp.com",
  databaseURL: "https://klasbeheer-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "klasbeheer",
  storageBucket: "klasbeheer.firebasestorage.app",
  messagingSenderId: "573161343925",
  appId: "1:573161343925:web:5eb7f6408e9441276fa7fc",
  measurementId: "G-1340LLBD63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export the necessary functions for use in other modules
export { database, ref, get, update };
