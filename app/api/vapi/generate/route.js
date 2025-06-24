import { db } from "@/Firebase/Firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

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

// POST route
export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body = {};

    // ✅ Safely parse body
    const rawBody = await req.text();
    console.log("🧪 Raw Body:", rawBody);

    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawBody);
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON format." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported content type." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { cuisine, budget, location, userid } = body;

    // ✅ Input validation
    if (!cuisine || !budget || !location || !userid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing one or more required fields: cuisine, budget, location, userid.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Generate restaurant recommendations
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

⚠️ DO NOT use markdown. Return only raw JSON.`,
    });

    // ✅ Parse Gemini's response safely
    const jsonStart = recommendationsText.indexOf("[");
    const jsonEnd = recommendationsText.lastIndexOf("]");
    const jsonText = recommendationsText.slice(jsonStart, jsonEnd + 1).trim();

    let suggestions;
    try {
      suggestions = JSON.parse(jsonText);
    } catch (err) {
      console.error("❌ Error parsing Gemini output:", err);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Gemini response format." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Save to Firestore
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

    return new Response(
      JSON.stringify({ success: true, data: suggestions }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("🔥 Error in POST /api/vapi/generate:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
