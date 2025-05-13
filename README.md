# 🍽️ AI Restaurants Recommendation – Voice-Powered by Vapi AI

📋 **Table of Contents**  
- 🤖 [Introduction](#-introduction)  
- ⚙️ [Tech Stack](#-tech-stack)  
- 🔋 [Features](#-features)  
- 🚀 [Quick Start](#-quick-start)  

---

## 🤖 Introduction

Built using **Next.js**, **Firebase**, and styled with **Tailwind CSS**, this AI-powered restaurant recommender app offers users personalized dining suggestions using voice interaction. Integrated with **Vapi AI voice agents** and **Google Gemini**, users can simply talk and get smart restaurant suggestions based on their **budget**, **location**, and **preferred cuisine**.

The goal is to provide a modern, intuitive experience for foodies who prefer voice-first AI-powered discovery.

---

## ⚙️ Tech Stack

- ⚡ **Next.js** – Frontend & backend logic  
- 🔐 **Firebase** – Authentication & Firestore database  
- 🎨 **Tailwind CSS** – Utility-first modern styling  
- 🗣 **Vapi AI** – Voice-based interaction  
- 🤖 **Google Gemini** – Natural language understanding  
- 🧩 **shadcn/ui** – Elegant UI components  

---

## 🔋 Features

- 🧠 **Voice Assistant**: Ask for restaurant recommendations using voice — powered by Vapi AI  
- ⚡ **Real-time Suggestions**: Instantly get personalized suggestions  
- 📍 **Location & Budget Based**: Input location and budget to receive relevant options  
- 🗣 **Multi-language Support**: Accepts location input in **English and Hindi**  
- 🔐 **User Authentication**: Sign up / Sign in using Firebase  
- 💻 **Modern UI**: Built with TailwindCSS + shadcn/ui for a clean interface  
- 📌 **Google Maps Integration**: Open locations directly in Google Maps  
- 🔑 **Role-based Navigation**: “Ask AI” appears only when user is logged in  

---

## 🚀 Quick Start

### ✅ Prerequisites

Ensure you have:

- Git  
- Node.js  
- npm  

---

### 🔽 Cloning the Repository

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

### ⚙️ Set Up Environment Variables

Create a `.env.local` file in the root of the project and add the following:

```env

NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_BASE_URL=

```

---

### ▶️ Start the Dev Server

```bash
npm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🙌 Contribution

Feel free to fork, enhance, or raise issues. Let's build smarter AI assistants together 🚀
