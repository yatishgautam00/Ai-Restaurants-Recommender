"use client";

import { useEffect, useState } from "react";
import { getUserRecommendations } from "@/Firebase/FirebaseAPI";

export default function TestRecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null); // Expecting a single recommendation
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecs = async () => {
      const res = await getUserRecommendations();
      setLoading(false);

      if (res.success) {
        setRecommendation(res.data); // Set the single recommendation data
      } else {
        setError(res.error);
      }
    };

    fetchRecs();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Recommendations</h1>

      {loading && <p>Loading...</p>}

      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !recommendation && <p>No active recommendations found.</p>} {/* Handle case where no recommendation is available */}

      {recommendation && (
        <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
          <p className="font-semibold">🍽 {recommendation.suggestions[0]?.name}</p> {/* Assuming suggestions is an array */}
          <p>{recommendation.suggestions[0]?.description}</p>
          <p className="text-sm text-gray-500">Budget: {recommendation.suggestions[0]?.budget}</p>
          <p className="text-sm text-gray-500">
            Address: {recommendation.suggestions[0]?.address}, {recommendation.suggestions[0]?.location}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Created: {recommendation.createdAt?.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
