"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ArrowRight, UploadCloud } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    // Generate a random unique ID
    const roomId = uuidv4();
    // Redirect the user to that room
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full bg-opacity-20 animate-pulse">
            <UploadCloud size={64} className="text-blue-500" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AirLink Files
        </h1>
        
        <p className="text-xl text-gray-400">
          Peer-to-Peer file sharing. Unlimited size. No login.
        </p>

        <button
          onClick={createRoom}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-all duration-200"
        >
          <span>Start New Transfer</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </main>
  );
}