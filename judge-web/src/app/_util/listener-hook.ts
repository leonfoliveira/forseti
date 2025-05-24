import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriber = (...args: any[]) => any;

export function useListener<TSubscriber extends Subscriber>(
  subscriber: TSubscriber,
  unsubscriber: (id: string) => void,
) {
  const listenerRef = useRef<string>(null);

  async function subscribe(...args: Parameters<TSubscriber>) {
    listenerRef.current = await subscriber(...args);
  }

  function unsubscribe() {
    if (!listenerRef.current) return;
    unsubscriber(listenerRef.current);
  }

  useEffect(() => unsubscribe, []);

  return { subscribe, unsubscribe };
}
