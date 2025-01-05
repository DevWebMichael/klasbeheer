// Firebase configuratie
  // Import the functions you need from the SDKs you need
  //import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  //import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  const analytics = getAnalytics(app);

  // Fetch data
    const dbRef = database.ref('klassen');
    dbRef.get().then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

  