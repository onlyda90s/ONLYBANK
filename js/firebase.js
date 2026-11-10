// Firebase 모듈 불러오기 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 발급받은 파이어베이스 설정값
const firebaseConfig = {
  apiKey: "AIzaSyC2FTjE-9Un5XwTf6KKOV40xUHU9HAEK8I",
  authDomain: "onlyview-finance.firebaseapp.com",
  projectId: "onlyview-finance",
  storageBucket: "onlyview-finance.firebasestorage.app",
  messagingSenderId: "814399924265",
  appId: "1:814399924265:web:76153feb27e12a848fd438"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { signInWithPopup, signOut, onAuthStateChanged };
