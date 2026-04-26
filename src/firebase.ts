import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, onSnapshot, Timestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Connection test as per guidelines
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc from server to verify connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore configuration error: The client is offline. Please check your Firebase setup.");
    } else {
      console.warn("Firestore connection test warning (expected if doc doesn't exist):", error);
    }
  }
}
testConnection();

export { signInWithPopup, signInWithRedirect, signInAnonymously, signOut, onAuthStateChanged };
export type { User };
