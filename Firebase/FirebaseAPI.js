import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs,orderBy, Timestamp } from "firebase/firestore";

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

export const getUserRecommendations = async () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Ensure it runs only once

      if (!user) {
        return resolve({ success: false, error: "No user is currently logged in." });
      }

      try {
        // Create a query to fetch the document where userId matches and state is "active"
        const q = query(
          collection(db, "recommendations"),
          where("userId", "==", user.uid), // Match the userId field
          where("status", "==", "active") // Only fetch documents where the state is "active"
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return resolve({ success: false, error: "No active recommendations found." });
        }

        // Assuming there's only one document with userId and state as active
        const recommendationDoc = querySnapshot.docs[0]; // Get the first matching document

        const data = recommendationDoc.data();
        console.log("Data retrieved:", data); // Log the data to verify the state field

        // Add the createdAt field properly
        const recommendation = {
          id: recommendationDoc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate() // Convert Firestore Timestamp to JS Date
            : new Date(data.createdAt), // Handle if it's already a Date or ISO string
        };

        resolve({ success: true, data: recommendation });
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
  });
};
