import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** Keep navigable screen choices in browser history, including across reloads. */
export function useUrlState<T extends string>(key: string, fallback: T, allowed?: readonly T[]) {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key) as T | null;
  const value = raw && (!allowed || allowed.includes(raw)) ? raw : fallback;
  const setValue = useCallback((next: T) => {
    setParams((current) => {
      const updated = new URLSearchParams(current);
      updated.set(key, next);
      return updated;
    });
  }, [key, setParams]);
  return [value, setValue] as const;
}
