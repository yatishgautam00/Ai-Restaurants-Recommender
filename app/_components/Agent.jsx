"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserData } from "@/Firebase/FirebaseAPI";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { assistant } from "@/constants";
import { useRef } from "react"; // Already should be imported
import { getUserRecommendations } from "@/Firebase/FirebaseAPI";

import { db } from "@/Firebase/Firebase"; // Ensure your firebase config exports 'db'
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  updateDoc,
  getDocs,
  doc,
  deleteDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

function Agent() {
  const router = useRouter();
  const [loadingRecommendation, setLoadingRecommendation] = useState(true);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [user, setUser] = useState("");
  const messagesEndRef = useRef(null);
  const [recommendations, setRecommendations] = useState([]);
  const [triggerRecommendationFetch, setTriggerRecommendationFetch] =
    useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = async () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);
  const deleteExpiredRecommendations = async () => {
    let currentUser = user;

    // ⏳ Try to fetch current user if not in state
    if (!currentUser?.uid) {
      console.warn("User UID not available in state. Trying to refetch...");
      const response = await getCurrentUserData(); // Assuming this function exists

      if (response.success) {
        currentUser = response.data;
        setUser(response.data); // Optionally persist user data
      } else {
        console.error("Failed to get current user. Skipping deletion.");
        return;
      }
    }

    if (!currentUser?.uid) {
      console.warn("User UID still undefined. Skipping Firestore deletion.");
      return;
    }

    try {
      // Query to get active recommendations for the current user
      const q = query(
        collection(db, "recommendations"),
        where("status", "==", "active"),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("No active recommendations found.");
        return;
      }

      const now = Date.now();

      // Iterate over the documents and delete those that are older than 5 minutes
      const deletePromises = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate?.(); // Convert Firestore Timestamp to JS Date

        if (createdAt) {
          const ageInMs = now - createdAt.getTime(); // Calculate age in milliseconds
          if (ageInMs > 5 * 60 * 1000) {
            // If older than 5 minutes
            console.log(`Deleting expired recommendation: ${docSnap.id}`);
            return deleteDoc(doc(db, "recommendations", docSnap.id)); // Delete the document
          }
        }

        return Promise.resolve(); // Skip deletion if not expired
      });

      // Wait for all deletions to finish
      await Promise.all(deletePromises);
      console.log("✅ Expired recommendations deleted.");
    } catch (error) {
      console.error("❌ Error deleting recommendation documents:", error);
    }
  };

  useEffect(() => {
    // Set up a timer to run the deletion function every minute
    const timer = setTimeout(() => {
      deleteExpiredRecommendations();
    }, 2 * 60 * 1000); // 1 minute

    return () => clearTimeout(timer); // Cleanup the timeout on component unmount
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getCurrentUserData();
      if (response.success) {
        setUser(response.data);
      }
    };
    fetchUser();
  }, []);

 useEffect(() => {
  const q = query(
    collection(db, "recommendations"),
    orderBy("createdAt", "desc"), // Sort by newest first
    limit(1) // Only fetch the most recent one
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((doc) => doc.data());
        setRecommendations(docs); // Will contain only 1 item
      } else {
        setRecommendations([]);
      }
      setLoadingRecommendation(false);
    },
    (error) => {
      console.error("Error fetching latest recommendation:", error);
      setLoadingRecommendation(false);
    }
  );

  return () => unsubscribe();
}, []); // No dependency on 'user' now

  useEffect(() => {
    console.log("Fetched recommendations:", recommendations);
  }, [recommendations]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const { uid, email } = user;

    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
      variableValues: {
        userid: user.uid,
      },
    });
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };  

  return (
    <div className="grid grid-cols-4 gap-4 justify-center items-start h-full">
      {/* AI Recommender Card */}
      <div className="flex flex-col gap-4 col-span-1 justify-start items-center">
        <div className="flex flex-row justify-center items-center gap-1">
          <div className="avatar">
            <Image
              src="/ai-image.jpg"
              alt="profile-image"
              width={50}
              height={50}
              className="object-cover rounded-full"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <div className="flex flex-col gap-1 p-1">
            <h3>AI Recommender</h3>
            <h4>AI Venus</h4>
          </div>
        </div>

        {/* Call button */}
        <div className="flex justify-center mt-4">
          {callStatus !== "ACTIVE" ? (
            <Button className="relative btn-call" onClick={() => handleCall()}>
              <span
                className={cn(
                  "absolute animate-ping rounded-full opacity-75",
                  callStatus !== "CONNECTING" && "hidden"
                )}
              />
              <span className="relative">
                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Start Conversation"
                  : ". . ."}
              </span>
            </Button>
          ) : (
            <Button
              className="btn-disconnect"
              onClick={() => handleDisconnect()}
            >
              End Conversation
            </Button>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="col-span-3 flex flex-col justify-between h-full">
        {/* User Profile Card */}
        <div className="card-content flex justify-end items-center flex-row mb-4">
          <Image
            src="/user.png"
            alt="profile-image"
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col justify-center  p-1">
            <h3>User Email</h3>
            <h3>{user.email}</h3>
          </div>
        </div>

        {/* Chat and Recommendations */}
        <div className="flex flex-col bg-gray-200 rounded-2xl border-2 outline-2 h-[75vh]">
          {/* Chat messages container with scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="chat-container flex flex-col space-y-3 p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-white ${
                      msg.role === "user" ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {loadingRecommendation && (
                <p className="text-sm text-gray-400 mt-2">
                  Loading recommendations...
                </p>
              )}
              <div ref={messagesEndRef} />
              {/* Recommendations fixed at bottom (scrolls if long) */}
              {recommendations.length > 0 && !loadingRecommendation && (
                <div className="recommendations-container overflow-y-auto p-4 bg-gray-400 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-1">
                    Recommended restaurants:
                  </p>
                  <div className="flex flex-wrap gap-3 justify-between">
                    {recommendations.map((doc, docIndex) =>
                      doc.suggestions?.map((rec, i) => (
                        <div
                          key={`${docIndex}-${i}`}
                          className="bg-gray-300  text-sm  p-4 rounded-lg border border-gray-700 shadow-md w-full max-w-xs"
                        >
                          {/* Restaurant Name */}
                          <p className="text-lg font-semibold mb-2">
                            Name: {rec.name}
                          </p>

                          {/* <hr className="border-gray-600 mb-2" /> */}

                          {/* Description */}
                          {/* <p className="text-gray-300 mb-2">{rec.description}</p> */}

                          <hr className="border-gray-600 mb-2" />

                          {/* Budget */}
                          <p className=" text-lg mb-1">
                            <span className="font-medium">Budget:</span>{" "}
                            {rec.budget}
                          </p>
                          <hr className="border-gray-600 mb-2" />

                          {/* Address */}
                          <p className=" text-lg mb-1">
                            <span className="font-medium">Address:</span>{" "}
                            {rec.address}
                          </p>
                          <hr className="border-gray-600 mb-2" />

                          {/* Location */}
                          <p className=" text-lg mb-3">
                            {/* <span className="font-medium">Location:</span> {rec.location} */}
                          </p>

                          {/* Google Maps link box */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${rec.address}, ${rec.location}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-auto text-center bg-blue-700 hover:bg-blue-800 transition-colors text-white text-xs py-2 px-3 rounded-md"
                          >
                            View on Google Maps 🗺️
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Agent;
