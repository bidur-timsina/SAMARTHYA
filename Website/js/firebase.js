import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBiSjTecTtmsL_-vDsagLjRWvpsJCQ4ITs",
  authDomain: "samrthya-4b8e7.firebaseapp.com",
  projectId: "samrthya-4b8e7",
  storageBucket: "samrthya-4b8e7.firebasestorage.app",
  messagingSenderId: "275843003243",
  appId: "1:275843003243:web:097c3e59575dbe3349922e",
  measurementId: "G-34RJ3WHK9V",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analytics = await analyticsSupported().then((supported) => {
  if (!supported) return null;
  return getAnalytics(app);
});
