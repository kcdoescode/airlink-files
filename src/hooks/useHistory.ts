import { useState, useEffect } from "react";

export type HistoryItem = {
  id: string;
  fileName: string;
  fileSize: number;
  type: "sent" | "received";
  timestamp: number;
};

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("airlink_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("airlink_history", JSON.stringify(history));
    }
  }, [history]);

  const addToHistory = (fileName: string, fileSize: number, type: "sent" | "received") => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      fileName,
      fileSize,
      type,
      timestamp: Date.now(),
    };
    
    setHistory((prev) => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("airlink_history");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return { history, addToHistory, clearHistory, formatBytes };
};