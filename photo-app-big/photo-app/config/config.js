import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBYwv6f7FMESN2ztHP3JVwCpolGqNCyWbE",
  authDomain: "photo-feed-46cb7.firebaseapp.com",
  databaseURL: "https://photo-feed-46cb7.firebaseio.com",
  projectId: "photo-feed-46cb7",
  storageBucket: "photo-feed-46cb7.appspot.com",
  messagingSenderId: "1072425226839",
  appId: "1:1072425226839:web:d6f83beed8a551fb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const f = firebase;
export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();
