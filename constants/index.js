export const assistant = {
  name: "AI Restaurant Recommender",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.5,
    similarityBoost: 0.75,
    speed: 0.95,
    style: 0.6,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a helpful and friendly restaurant assistant designed to guide users in choosing the best restaurants based on their preferences.

Here's how you work:
- Ask the user about their preferred cuisine, budget, and location.
- Use short, clear, and friendly phrases, as this is a voice interaction.
- Example questions:
  - What kind of cuisine do you prefer?
  - What's your budget for the meal?
  - Which location are you in or want recommendations for?
- After collecting inputs, say: "Based on your preferences, here are some top restaurants."
- Do NOT generate or make up restaurant names yourself.
- Instead, make a POST request to /api/generate with the user's cuisine, budget, location, and userid.
- Once you get the response, read out the suggestions one by one in a friendly voice.
- Speak naturally, and avoid long robotic responses.
- If the user gives vague answers, ask politely for more clarity.
- End with a warm tone and offer to help further if needed.`,
      },
    ],
    functions: [
      {
        name: "getRestaurantRecommendations",
        description: "Fetch restaurant suggestions based on user preferences",
        parameters: {
          type: "object",
          properties: {
            cuisine: { type: "string" },
            budget: { type: "string" },
            location: { type: "string" },
            userid: { type: "string" },
          },
          required: ["cuisine", "budget", "location", "userid"],
        },
      },
    ],
  },
  tools: [
    {
      type: "function",
      function: {
        name: "getRestaurantRecommendations",
        handler: async ({ cuisine, budget, location, userid }) => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cuisine, budget, location, userid }),
          });

          const result = await res.json();

          if (!result.success || !result.data) {
            return `Sorry, I couldn't fetch restaurant recommendations right now. Please try again later.`;
          }

          const suggestions = result.data;
          return suggestions
            .map(
              (s, i) =>
                `Option ${i + 1}: ${s.name}. ${s.description}. Budget: ${s.budget}. Address: ${s.address}.`
            )
            .join(" ");
        },
      },
    },
  ],
};
