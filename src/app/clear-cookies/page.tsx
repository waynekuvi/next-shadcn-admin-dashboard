"use client";

import { useState } from "react";

export default function ClearCookiesPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const clearCookies = async () => {
    setLoading(true);
    setStatus("Clearing cookies...");
    
    try {
      const response = await fetch("/api/clear-all-cookies", {
        method: "POST",
        credentials: "include", // Required to send/receive cookies
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Cleared ${data.cleared} cookies! Redirecting...`);
        // Redirect to home after 1 second
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        setStatus("❌ Failed to clear cookies");
      }
    } catch (error) {
      setStatus("❌ Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8 border border-zinc-800">
        <h1 className="text-2xl font-bold mb-4">Clear All Cookies</h1>
        <p className="text-zinc-400 mb-6">
          This will clear all cookies to fix HTTP 431 errors. You will need to log in again.
        </p>
        
        <button
              onClick={clearCookies}
              disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Clearing..." : "Clear All Cookies"}
        </button>
        
        {status && (
          <p className={`mt-4 text-sm ${status.includes("✅") ? "text-green-400" : "text-red-400"}`}>
            {status}
                      </p>
                    )}
                  </div>
    </div>
  );
}
