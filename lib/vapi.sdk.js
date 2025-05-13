"use client"; // ✅ Make sure this is at the top

import Vapi from "@vapi-ai/web";

// Only initialize in the browser
const vapi = typeof window !== "undefined" ? new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) : null;

export { vapi };
