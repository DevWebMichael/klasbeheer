// Firebase configuratie
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
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Fetch data
  const dbRef = database.ref('klassen');
  dbRef.get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  