window.firebaseConfig = {
  apiKey: "AIzaSyDnQMuPvx_Gr8VjBJf_Hrx39O8w2dm67co",
  authDomain: "fanta-athletic.firebaseapp.com",
  projectId: "fanta-athletic",
  storageBucket: "fanta-athletic.firebasestorage.app",
  messagingSenderId: "845950461193",
  appId: "1:845950461193:web:04475bb0eaa2dc459a9fd8",
  measurementId: "G-289T0N4D8L"
};

// Initialize Firebase
firebase.initializeApp(window.firebaseConfig);
window.db = firebase.firestore();
