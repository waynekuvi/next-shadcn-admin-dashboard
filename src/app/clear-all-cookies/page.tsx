"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ClearAllCookiesPage() {
  const [status, setStatus] = useState("Preparing to clear all cookies...");
  const [cleared, setCleared] = useState(0);

  useEffect(() => {
    // Clear all cookies for all localhost ports
    const clearAllCookies = () => {
      let count = 0;
      
      // Get all cookies
      const cookies = document.cookie.split(";");
      
      // Clear cookies for current domain
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Delete cookie for current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        
        // Delete cookie for root path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost`;
        
        count++;
      });
      
      // Also clear localStorage and sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error("Error clearing storage:", e);
      }
      
      setCleared(count);
      setStatus(`✅ Cleared ${count} cookies! Redirecting...`);
      
      // Redirect after 1 second
      setTimeout(() => {
        window.location.href = "/auth/v2/login";
      }, 1000);
    };

    clearAllCookies();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <h1 className="text-2xl font-bold mb-4">Clearing All Cookies</h1>
      <p className="text-muted-foreground mb-6 text-center">{status}</p>
      {cleared > 0 && (
        <p className="text-sm text-green-600">Cleared {cleared} cookies</p>
      )}
    </div>
  );
}

