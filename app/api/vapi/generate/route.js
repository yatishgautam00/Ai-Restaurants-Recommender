import { db } from "@/Firebase/Firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req) {
  try {
    const body = await req.json();
    const { cuisine, budget, location, userid } = body;

    // ✅ Validate inputs
    if (!cuisine || !budget || !location || !userid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing one or more required fields: cuisine, budget, location, userid.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Generate recommendations using Gemini
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

    // ✅ Sanitize and parse Gemini's response
    const jsonStart = rawResponse.indexOf("[");
    const jsonEnd = rawResponse.lastIndexOf("]");
    const jsonText = rawResponse.slice(jsonStart, jsonEnd + 1).trim();

    let suggestions;
    try {
      suggestions = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error("Failed to parse Gemini response as valid JSON.");
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

    return new Response(JSON.stringify({ success: true, data: suggestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔥 Error generating or saving recommendations:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
