import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDgMaOGpBIINYWK8E5aB8csyU-IncvxVM4",
  authDomain: "autodocssavedata.firebaseapp.com",
  databaseURL: "https://autodocssavedata-default-rtdb.firebaseio.com",
  projectId: "autodocssavedata",
  storageBucket: "autodocssavedata.firebasestorage.app",
  messagingSenderId: "1036581214195",
  appId: "1:1036581214195:web:3efbd7316b6a3113136486",
  measurementId: "G-JXEFNCBDYJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);