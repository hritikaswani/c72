import * as firebase from 'firebase'
require("@firebase/firestore")

var firebaseConfig = {
    apiKey: "AIzaSyCvZYRsMCPTU6e3xMQYQhxzYnhGPlJ0xEA",
    authDomain: "wily-212a6.firebaseapp.com",
    projectId: "wily-212a6",
    storageBucket: "wily-212a6.appspot.com",
    messagingSenderId: "428751567466",
    appId: "1:428751567466:web:dab3fc6f471ef33fa12813"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()