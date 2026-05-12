import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
           signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

  // SECURITY: Replace these values with your actual Firebase config.
  // Get them from Firebase Console → Project Settings → Your apps → Web app config.
  // Restrict this API key to your domain in Google Cloud Console.
  var firebaseConfig = {
    apiKey: "AIzaSyCtwgwMJ9f5Oo7iTBHUkgPNJ4U-BAxlrW8",
    authDomain: "babspharmcloud.firebaseapp.com",
    projectId: "babspharmcloud",
    storageBucket: "babspharmcloud.appspot.com",
    messagingSenderId: "385674572482",
    appId: "1:385674572482:web:a427125e649fef011b815b",
    measurementId: "G-ZM6EX0MWZL"
  };

  var fbApp = initializeApp(firebaseConfig);
  var fbAuth = getAuth(fbApp);

  // Expose auth functions to global scope for use by existing code
  window._fbAuth = fbAuth;
  window._fbSignIn = function(email, password) {
    return signInWithEmailAndPassword(fbAuth, email, password);
  };
  window._fbSignUp = function(email, password) {
    return createUserWithEmailAndPassword(fbAuth, email, password);
  };
  window._fbSignOut = function() {
    return signOut(fbAuth);
  };
  window._fbOnAuthStateChanged = function(cb) {
    return onAuthStateChanged(fbAuth, cb);
  };