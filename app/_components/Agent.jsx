import Image from 'next/image';
import React from 'react'

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

function Agent({userName}) {
    
  const isSpeaking = true;
  return (
   <>
  <div className="flex flex-col md:flex-row items-center justify-center gap-10 my-8">
    {/* AI Interviewer Card */}
    <div className="flex flex-col items-center gap-2 bg-white shadow-md rounded-xl p-6 w-64">
      <div className="relative rounded-full">
        <Image
          src="/ai-image.jpg"
          alt="AI Avatar"
          width={100}
          height={100}
          className="object-cover rounded-full"
        />
        {/* Speaking Indicator */}
        <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-center">MockGorilla</h3>
    </div>

    {/* User Profile Card */}
    <div className="flex flex-col items-center gap-2 bg-white shadow-md rounded-xl p-6 w-64">
      <Image
        src="/user.png"
        alt="User Profile"
        width={120}
        height={120}
        className="rounded-full object-cover"
      />
      <h3 className="text-lg font-semibold text-center">John Doe</h3>
    </div>
  </div>

  {/* Transcript */}
  <div className="w-full flex justify-center my-6">
    <div className="max-w-xl bg-gray-100 p-4 rounded-lg shadow-sm">
      <p className="text-base text-gray-800 animate-fadeIn transition-opacity duration-500">
        Hello, how can I help you?
      </p>
    </div>
  </div>

  {/* Call Button */}
  <div className="w-full flex justify-center mt-4">
    <button className="relative bg-blue-600 text-white font-medium px-6 py-3 rounded-full hover:bg-blue-700 transition">
      <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75" />
      <span className="relative">Call</span>
    </button>
  </div>
</>


  )
}

export default Agent