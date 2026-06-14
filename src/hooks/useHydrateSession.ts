"use client";

import { useEffect } from "react";
import { useQuizStore } from "@/lib/store";

/** Rehydrates the Zustand quiz store from sessionStorage on mount. */
export function useHydrateSession() {
  const hydrateFromSession = useQuizStore((s) => s.hydrateFromSession);
  useEffect(() => {
    hydrateFromSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
