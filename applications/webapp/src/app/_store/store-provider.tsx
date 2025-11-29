"use client";

import { useRef } from "react";
import { Provider } from "react-redux";

import { AppStore, makeStore, RootState } from "@/app/_store/store";

export function StoreProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
