🍽️ AI Restaurants Recommendation – Voice-Powered by Vapi AI
📋 Table of Contents

🤖 Introduction

⚙️ Tech Stack

🔋 Features

🚀 Quick Start

🤖 Introduction
Built using Next.js, Firebase, and styled with Tailwind CSS, this AI-powered restaurant recommender app offers users personalized dining suggestions using voice interaction. Integrated with Vapi AI voice agents and Google Gemini, users can simply talk and get smart restaurant suggestions based on their budget, location, and preferred cuisine.

The goal is to provide a modern, intuitive experience for foodies who prefer voice-first AI-powered discovery.

⚙️ Tech Stack
Next.js – Frontend & backend logic

Firebase – Authentication & Firestore database

Tailwind CSS – Utility-first modern styling

Vapi AI – Voice-based interaction

Google Gemini – Natural language understanding and contextual processing

shadcn/ui – Elegant UI components

Zod – Schema validation

🔋 Features
👉 Voice Assistant: Ask for restaurant recommendations using voice — powered by Vapi AI.
👉 Real-time Suggestions: Instantly get personalized restaurant suggestions.
👉 Location & Budget Based: Input location and budget to receive relevant options.
👉 Multi-language Support: Accepts input in English and Hindi (for locations).
👉 User Authentication: Sign up / Sign in using Firebase email/password auth.
👉 Modern UI: Built with shadcn/ui and TailwindCSS for a clean and responsive interface.
👉 Recommendations Page: View dynamically fetched suggestions from Firestore.
👉 Google Maps Integration: Open location directly on Google Maps.
👉 Role-based Navigation: “Ask AI” available only when user is logged in.
👉 Responsive: Works seamlessly on mobile, tablet, and desktop.

🚀 Quick Start
Follow these steps to set up the project locally on your machine.

✅ Prerequisites
Make sure the following are installed:

Git

Node.js

npm (Node Package Manager)

🔽 Cloning the Repository
bash
Copy
Edit
git clone https://github.com/your-username/ai-restaurant-recommender.git
cd ai-restaurant-recommender
📦 Installation
Install dependencies:

bash
Copy
Edit
npm install
⚙️ Set Up Environment Variables
Create a file named .env.local in the root directory and add the following:

env
Copy
Edit

NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_BASE_URL=



Replace these values with your actual Firebase, Vapi, and Google Gemini credentials.

▶️ Running the App
bash
Copy
Edit
npm run dev
Now open http://localhost:3000 in your browser to explore your AI-powered restaurant recommender!
