"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { InquiryOverride, InquiryOverrides } from "./types";

const STORAGE_KEY = "northwind.inquiry-overrides.v1";

// A small localStorage-backed store read through useSyncExternalStore. This is
// the React-recommended way to subscribe to an external source: it serves a
// stable empty snapshot during SSR/hydration (so server and client markup
// match) and switches to the persisted value right after mount, with no
// setState-in-effect and no hydration mismatch.
const EMPTY: InquiryOverrides = {};

function readStored(): InquiryOverrides {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InquiryOverrides) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let cache: InquiryOverrides = readStored();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setCache(next: InquiryOverrides) {
  cache = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Ignore quota/availability errors.
  }
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = readStored();
      emit();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => cache;
const getServerSnapshot = () => EMPTY;

// `hydrated` flips from false (server) to true (client) after mount, via the
// same external-store mechanism, so it stays lint-clean too.
const noopSubscribe = () => () => {};
const trueSnapshot = () => true;
const falseSnapshot = () => false;

export function useOverrides() {
  const overrides = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, trueSnapshot, falseSnapshot);

  const updateOverride = useCallback((id: string, patch: Partial<InquiryOverride>) => {
    const merged = { ...cache[id], ...patch } as InquiryOverride;
    // Drop keys that were explicitly cleared (set to undefined).
    (Object.keys(merged) as (keyof InquiryOverride)[]).forEach((k) => {
      if (merged[k] === undefined) delete merged[k];
    });
    const next = { ...cache };
    if (Object.keys(merged).length === 0) delete next[id];
    else next[id] = merged;
    setCache(next);
  }, []);

  const resetOverride = useCallback((id: string) => {
    const next = { ...cache };
    delete next[id];
    setCache(next);
  }, []);

  const resetAll = useCallback(() => setCache({}), []);

  return { overrides, hydrated, updateOverride, resetOverride, resetAll };
}
