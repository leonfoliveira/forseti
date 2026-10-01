"use client";

import { useState } from "react";
import { Provider } from "react-redux";

import { makeStore, RootState } from "@/app/_store/Store";

/**
 * Provides the Redux store to the React component tree.
 */
export function StoreProvider({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}) {
  const [store] = useState(() => makeStore(preloadedState));

  return <Provider store={store}>{children}</Provider>;
}
