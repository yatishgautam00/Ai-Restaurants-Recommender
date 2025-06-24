import { db } from "@/Firebase/Firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req) {
  try {
    // 🔒 Parse body safely
    const contentType = req.headers.get("content-type") || "";
    let body = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = {
        cuisine: formData.get("cuisine"),
        budget: formData.get("budget"),
        location: formData.get("location"),
        userid: formData.get("userid"),
        status: formData.get("status") || "active",
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported content type." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { cuisine, budget, location, userid } = body;

    // ✅ Validate required fields
    if (!cuisine || !budget || !location || !userid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing one or more required fields: cuisine, budget, location, userid.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🧠 Ask Gemini to generate 3 restaurant recommendations
    const { text: rawResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Suggest 3 restaurants based on:
- Cuisine: ${cuisine}
- Budget: ${budget}
- Location: ${location}

Return only this exact format (valid raw JSON, no markdown):

[
  {
    "name": "Restaurant A",
    "description": "Authentic ${cuisine} cuisine",
    "budget": "${budget}",
    "address": "Full address",
    "location": "Google Maps link or coordinates"
  },
  ...
]`,
    });

    // 🧹 Clean and safely parse Gemini response
    const jsonStart = rawResponse.indexOf("[");
    const jsonEnd = rawResponse.lastIndexOf("]");
    const jsonText = rawResponse.slice(jsonStart, jsonEnd + 1).trim();

    let suggestions;
    try {
      suggestions = JSON.parse(jsonText);
    } catch (err) {
      throw new Error("Failed to parse Gemini response as valid JSON.");
    }

    // ✅ Save to Firestore
    const docData = {
      status: "active",
      cuisine,
      budget,
      location,
      userId: userid,
      suggestions,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "recommendations"), docData);

    // ✅ Respond with success and data
    return new Response(JSON.stringify({ success: true, data: suggestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔥 Error in POST /api/vapi/generate:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
