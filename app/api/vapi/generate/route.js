import { db } from "@/Firebase/Firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import admin from "firebase-admin";

// ✅ Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
  });
}

// ✅ GET route (optional)
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

// ✅ POST route
export async function POST(req) {
  try {
    // 🔐 1. Get token from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Missing token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // 🔐 2. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userid = decodedToken.uid;

    // 📦 3. Parse body
    const body = await req.json();
    const { cuisine, budget, location } = body;

    if (!cuisine || !budget || !location) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing one or more required fields: cuisine, budget, location.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🤖 4. Call Gemini to generate restaurant recommendations
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

    // 🔍 5. Validate and parse JSON response from Gemini
    if (!recommendationsText) {
      console.error("❌ Gemini returned empty response.");
      return new Response(
        JSON.stringify({ success: false, error: "Empty response from AI." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let suggestions;
    try {
      suggestions = JSON.parse(recommendationsText);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", recommendationsText);
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI returned invalid JSON. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 📝 6. Store recommendations in Firestore
    const recommendations = {
      status: "active",
      cuisine,
      budget,
      location,
      userId: userid,
      suggestions,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "recommendations"), recommendations);

    // ✅ 7. Return success response
    return new Response(JSON.stringify({ success: true, data: suggestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔥 Error in /api/vapi/generate:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
