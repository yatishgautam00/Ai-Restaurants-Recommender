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
import { collection, query, where, onSnapshot } from "firebase/firestore";

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

    const onCallEnd = () => {
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
  if (!user?.uid) return; // Wait for user to be loaded

  const q = query(
    collection(db, "recommendations"),
    where("status", "==", "active"),
    where("userId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((doc) => doc.data());
        setRecommendations(docs);
      } else {
        setRecommendations([]);
      }
      setLoadingRecommendation(false);
    },
    (error) => {
      console.error("Error fetching active recommendations:", error);
      setLoadingRecommendation(false);
    }
  );

  return () => unsubscribe();
}, [user]); // Depend on 'user' so it refetches after user loads


  useEffect(() => {
    console.log("Fetched recommendations:", recommendations);
  }, [recommendations]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const { uid, email } = user;

    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
      variableValues: {
        userid: user.uid,
        useremail: user.email,
        status: "active",
      },
    });
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Recommender Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-image.jpg"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Recommender</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{user.email}</h3>
          </div>
        </div>
      </div>

      <div className="chat-container max-h-[60vh] overflow-y-auto p-4 space-y-3">
        {messages.length > 0 &&
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col items-start ${
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

              {/* Show recommendations if available */}
              {loadingRecommendation ? (
                <p className="text-sm text-gray-400 mt-2">
                  Loading recommendations...
                </p>
              ) : recommendations.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <p className="text-sm text-gray-400 ml-2 mb-1">
                    Recommended restaurants:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-gray-900 text-white text-xs px-4 py-3 rounded-md border border-gray-700 shadow-sm w-full max-w-xs"
                      >
                        <p className="font-semibold mb-1">🍽 {rec.name}</p>
                        <p className="text-gray-300 mb-1">{rec.description}</p>
                        <p className="text-gray-400 text-[11px]">
                          Budget: {rec.budget}
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          Address: {rec.address}, {rec.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}

        {/* Scroll anchor at bottom */}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
}

export default Agent;
