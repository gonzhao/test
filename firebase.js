import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiTdnkKEktDLmRfoPaUIhB89K2dplaUWs",
  authDomain: "blog-website-2fb27.firebaseapp.com",
  projectId: "blog-website-2fb27",
  storageBucket: "blog-website-2fb27.appspot.com",
  messagingSenderId: "1011737736353",
  appId: "1:1011737736353:web:4a17a396db36a2a7936ce0"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage(app);

export { db, storage, auth }; 


