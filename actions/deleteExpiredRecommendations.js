import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust this path as needed
import { getCurrentUserData } from "@/lib/firebaseAPI"; // your helper to get the current user

export const deleteExpiredRecommendations = async (user, setUser) => {
  let currentUser = user;

  // ⏳ Try to fetch current user if not in state
  if (!currentUser?.uid) {
    console.warn("User UID not available in state. Trying to refetch...");
    const response = await getCurrentUserData();

    if (response.success) {
      currentUser = response.data;
      if (setUser) setUser(response.data); // Optional: persist user in state
    } else {
      console.error("❌ Failed to get current user. Skipping deletion.");
      return;
    }
  }

  if (!currentUser?.uid) {
    console.warn("❌ User UID still undefined. Skipping Firestore deletion.");
    return;
  }

  try {
    const q = query(
      collection(db, "recommendations"),
      where("status", "==", "active"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("ℹ️ No active recommendations found.");
      return;
    }

    const now = Date.now();

    const deletePromises = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate?.(); // Convert Firestore Timestamp to JS Date

      if (createdAt && now - createdAt.getTime() > 1 * 60 * 1000) {
        console.log(`🗑️ Deleting expired recommendation: ${docSnap.id}`);
        return deleteDoc(doc(db, "recommendations", docSnap.id));
      }

      return Promise.resolve(); // Skip if not expired
    });

    await Promise.all(deletePromises);
    console.log("✅ Expired recommendations deleted.");
  } catch (error) {
    console.error("❌ Error deleting recommendation documents:", error);
  }
};
    