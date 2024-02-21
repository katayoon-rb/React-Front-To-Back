import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC2OkxTkdFB-Z8G3JwWRslf0nWy86l0lPI",
  authDomain: "house-marketplace-app-dd997.firebaseapp.com",
  databaseURL: "https://house-marketplace-app-dd997-default-rtdb.firebaseio.com",
  projectId: "house-marketplace-app-dd997",
  storageBucket: "house-marketplace-app-dd997.appspot.com",
  messagingSenderId: "677653120827",
  appId: "1:677653120827:web:09c959035051478af1991e"
}

// Initialize Firebase
initializeApp(firebaseConfig)
export const db = getFirestore()
