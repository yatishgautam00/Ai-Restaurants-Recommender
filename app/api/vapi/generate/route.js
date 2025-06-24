import { db } from "@/Firebase/Firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore"; // ✅ Import required Firestore methods
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Firebase/Firebase"; // Ensure this is imported
// GET route
export async function GET() {
  return new Response(
    JSON.stringify({
      success: true,
      data: "Welcome to AI Restaurant Recommender!",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
function getCurrentUserUID() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // cleanup listener
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error("User not authenticated."));
      }
    });
  });
}

// POST route to handle recommendations
export async function POST(req) {
  try {
    const body = await req.json();
    const { cuisine, budget, location } = body;

    // Validate inputs
    if (!cuisine || !budget || !location) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing one or more required fields: cuisine, budget, location, userid.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const userId = await getCurrentUserUID();

    // Generate recommendations from Gemini
    const { text: recommendationsText } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Suggest 3 restaurants based on user preferences:
- Preferred cuisine: ${cuisine}
- Budget: ${budget}
- Location: ${location}

Format as a JSON array like:
[
  {
    "name": "Restaurant A",
    "description": "Authentic ${cuisine} food",
    "budget": "Within ${budget}",
    "address": "Full address here",
    "location": "Google Maps link or coordinates"
  },
  ...
]

⚠️ Do NOT include any markdown formatting like triple backticks (\`\`\`) or code blocks. Return only valid raw JSON.`,
    });

    const suggestions = JSON.parse(recommendationsText);

    // Save to Firestore using modular SDK
    const recommendations = {
      status: "active",
      cuisine,
      budget,
      location,
      userId: userId, // variable, but stored as field "userId"
      suggestions,
      createdAt: Timestamp.now(), // proper Firestore timestamp
    };
    await addDoc(collection(db, "recommendations"), recommendations);

    return new Response(JSON.stringify({ success: true, data: suggestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔥 Error generating or saving recommendations:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
