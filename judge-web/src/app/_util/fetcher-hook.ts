import { useState } from "react";

export function useFetcher<T>(initialData?: T | null) {
  const [state, setState] = useState({
    isLoading: false,
    hasError: false,
    data: initialData,
  });

  async function fetch(fn: () => Promise<T>) {
    setState({ isLoading: true, hasError: false, data: null });
    try {
      const data = await fn();
      setState({ isLoading: false, hasError: false, data });
      return data;
    } catch (error) {
      setState({ isLoading: false, hasError: true, data: null });
      throw error;
    }
  }

  return { ...state, fetch };
}
