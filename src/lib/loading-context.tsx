"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LoadingContextType {
  isLoading: boolean;
  message: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: null,
  startLoading: () => {},
  stopLoading: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [activeRequests, setActiveRequests] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleStart = (e: any) => {
      setActiveRequests((prev) => prev + 1);
      if (e.detail?.message) setMessage(e.detail.message);
    };

    const handleStop = () => {
      setActiveRequests((prev) => Math.max(0, prev - 1));
      if (activeRequests <= 1) setMessage(null);
    };

    window.addEventListener("api_loading_start", handleStart);
    window.addEventListener("api_loading_stop", handleStop);

    return () => {
      window.removeEventListener("api_loading_start", handleStart);
      window.removeEventListener("api_loading_stop", handleStop);
    };
  }, [activeRequests]);

  const startLoading = (msg?: string) => {
    setActiveRequests((prev) => prev + 1);
    if (msg) setMessage(msg);
  };

  const stopLoading = () => {
    setActiveRequests((prev) => Math.max(0, prev - 1));
  };

  const isLoading = activeRequests > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, message, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useApiLoading() {
  return useContext(LoadingContext);
}

/**
 * Utility helper to dispatch global loading state for standard fetch calls
 */
export function triggerGlobalLoading(active: boolean, message?: string) {
  if (typeof window === "undefined") return;
  if (active) {
    window.dispatchEvent(new CustomEvent("api_loading_start", { detail: { message } }));
  } else {
    window.dispatchEvent(new CustomEvent("api_loading_stop"));
  }
}
