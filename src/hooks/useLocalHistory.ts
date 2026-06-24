import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "nexus_generations";

export interface LocalGeneration {
  id: string;
  timestamp: string;
  toolType: string;
  title: string;
  outputText: string;
  promptData: Record<string, unknown>;
  isFavorite: boolean;
}

export function useLocalHistory() {
  const [items, setItems] = useState<LocalGeneration[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback((item: Omit<LocalGeneration, "id" | "timestamp" | "isFavorite">) => {
    const newItem: LocalGeneration = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      isFavorite: false,
    };
    setItems((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
      } catch {
        // storage full
      }
      return updated;
    });
    return newItem;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { items, save, toggleFavorite, remove };
}
