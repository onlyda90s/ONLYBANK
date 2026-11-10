import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase 콘솔(프로젝트 설정 > 일반 > 내 앱)의 실제 키값
const firebaseConfig = {
    apiKey: "AIzaSyC2FTjE-9Un5XwTf6KKOV40xUHU9HAEK8I",
    authDomain: "onlyview-finance.firebaseapp.com",
    projectId: "onlyview-finance",
    storageBucket: "onlyview-finance.firebasestorage.app",
    messagingSenderId: "814399924265",
    appId: "1:814399924265:web:76153feb27e12a848fd438"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };
