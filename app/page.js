"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUserData } from "@/Firebase/FirebaseAPI"; // Adjust the import path

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
 // null = loading

  useEffect(() => {
    const checkUser = async () => {
      const res = await getCurrentUserData();
      setIsLoggedIn(res.success);
    };
    checkUser();
  }, []);

  return (
    <div>
      <section className="bg-white lg:grid lg:h-screen lg:place-content-center">
        <div className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-prose text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Discover perfect places to eat with
              <strong className="text-indigo-600"> AI-powered </strong>
              recommendations
            </h1>

            <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
              Get personalized restaurant suggestions based on your taste,
              location, and budget — instantly powered by smart AI. Whether it's
              street food or fine dining, we will guide you there.
            </p>

            <div className="mt-4 flex justify-center gap-4 sm:mt-6">
              {isLoggedIn === null ? (
                <p className="text-gray-500 text-sm">Checking authentication...</p>
              ) : isLoggedIn ? (
                <Link
                  className="inline-block rounded border border-indigo-600 bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                  href="/chat"
                >
                  Ask AI ➜
                </Link>
              ) : (
                <Link
                  className="inline-block rounded border border-gray-200 px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
                  href="/signup"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
