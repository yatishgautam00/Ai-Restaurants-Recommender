# 🍽️ AI Restaurants Recommendation – Voice-Powered by Vapi AI

📋 **Table of Contents**  
- 🤖 [Introduction](#-introduction)  
- ⚙️ [Tech Stack](#-tech-stack)  
- 🔋 [Features](#-features)  
- 🧠 [Architecture](#-architecture)  
- 🚀 [Quick Start](#-quick-start)  
- 🧪 [Testing](#-testing)  
- 📂 [Fine-tuning Dataset](#-fine-tuning-dataset)  
- 🎥 [Demo Video](#-demo-video)  

---

## 🤖 Introduction

This project is a **voice-interactive restaurant recommender** web app. Users can talk to an AI assistant to receive personalized restaurant suggestions based on their **cuisine**, **budget**, and **location** (supports Hindi and English). It's powered by **Vapi AI voice agents**, **Firebase**, and **Google Gemini**.

> 🎯 The goal is to create a smart, accessible, and intuitive food discovery experience using modern AI voice interaction.

---

## ⚙️ Tech Stack

- ⚡ **Next.js** – React framework for UI + backend
- 🔐 **Firebase** – Auth + Firestore database
- 🎨 **Tailwind CSS** – Beautiful utility-first design
- 🗣 **Vapi AI** – Voice agent integration
- 🧠 **Google Gemini** – Language processing & feedback
- 🧩 **shadcn/ui** – Elegant React UI components
- ✅ **Zod** – Schema validation

---

## 🔋 Features

- 🧠 AI-powered voice recommendations  
- 🔊 Ask in Hindi or English – works both ways  
- 📍 Smart suggestions based on location, budget, and cuisine  
- 🗺 Google Maps integration for directions  
- 🔐 Authenticated experience via Firebase  
- 📱 Fully responsive & mobile-friendly  
- 👤 Role-based UI (e.g., “Ask AI” shown only if user is logged in)  
- ✨ Clean, modern UI with smooth user flow

---

## 🧠 Architecture

```txt
Next.js (Frontend + API routes)
│
├── Firebase (Auth + Firestore)
│     └── Stores user profiles and recommendations
│
├── Vapi AI
│     └── Handles voice interaction workflow
│
├── Google Gemini
│     └── Enhances conversation and feedback logic
│
├── TailwindCSS + Shadcn/UI
│     └── UI Styling and components
│
└── Deployment (e.g. Vercel or Netlify)
```

---

## 🚀 Quick Start

### ✅ Prerequisites

- Node.js  
- npm  
- Git  

---

### 🔽 Clone the Repository

```bash
git clone https://github.com/your-username/ai-restaurant-recommender.git
cd ai-restaurant-recommender
```

---

### 📦 Install Dependencies

```bash
npm install
```

---

### ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_BASE_URL=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Replace with your Firebase, Vapi, and Gemini credentials.

---

### ▶️ Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

Basic test cases for API validation and UI rendering:

```bash
npm run test
```

You’ll find test files under `/__tests__` and `/utils/__tests__/`

- Unit tests for API routes  
- Mock data and sample inputs  
- Output assertions using `jest` or `vitest`

---

## 📂 Fine-tuning Dataset

Located at:

```
/data/fine-tune-dataset.json
```

Includes sample prompts like:

```json
{
  "input": "I want Italian food in Mumbai under 800 rupees",
  "output": {
    "location": "Mumbai",
    "budget": "800",
    "cuisine": "Italian"
  }
}

```

### Fine-tuning Instructions:

1. Use Gemini or OpenAI to fine-tune this input-output pattern.
2. Dataset is aligned for multilingual NLU use.
3. Update `/lib/parser.ts` to improve input extraction.

---

## 🎥 Demo Video

👉 [Watch on YouTube]()

> Demonstrates full workflow: voice query → AI processing → smart recommendations → map link

---

## 🙌 Contribution

Feel free to fork and enhance. Star ⭐ this repo if you liked the project!

---
