import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8uzSsMnQUC0af8fVorkzqr0b0U4D2-a8",
  authDomain: "sdk-io.firebaseapp.com",
  databaseURL: "https://sdk-io-default-rtdb.firebaseio.com",
  projectId: "sdk-io",
  storageBucket: "sdk-io.firebasestorage.app",
  messagingSenderId: "309372771670",
  appId: "1:309372771670:web:2b0e7d54f97074c964caf7",
  measurementId: "G-V8V976DJHC",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };
