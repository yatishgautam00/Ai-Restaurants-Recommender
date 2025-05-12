import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Create New User and Store in Firestore
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store email and uid in Firestore under "users" collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login User
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUserData = async () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // stop listening after first trigger

      if (!user) {
        return resolve({ success: false, error: "No user is currently logged in." });
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          resolve({ success: true, data: userDoc.data() });
        } else {
          resolve({ success: false, error: "User data not found in Firestore." });
        }
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
  });
};