import { act, render, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { Provider } from "react-redux";

import { HeroUIProvider } from "@/app/_lib/heroui-wrapper";
import { AppStore, makeStore, RootState } from "@/app/_store/store";
import messages from "@/i18n/messages/en-US.json";

interface WrapperProps {
  children: React.ReactNode;
  store: AppStore;
}

function Wrapper({ children, store }: WrapperProps) {
  return (
    <NextIntlClientProvider locale={"en-US"} messages={messages} timeZone="UTC">
      <HeroUIProvider>
        <Provider store={store}>{children}</Provider>
      </HeroUIProvider>
    </NextIntlClientProvider>
  );
}

export async function renderWithProviders(
  component: React.ReactNode,
  preloadedState: Partial<RootState> = {},
) {
  const store = makeStore(preloadedState);
  const container = await act(async () =>
    render(<Wrapper store={store}>{component}</Wrapper>),
  );
  return { store, ...container };
}

export async function renderHookWithProviders<T>(
  hook: () => T,
  preloadedState: Partial<RootState> = {},
) {
  const store = makeStore(preloadedState);
  const container = await act(async () =>
    renderHook(hook, {
      wrapper: ({ children }) => <Wrapper store={store}>{children}</Wrapper>,
    }),
  );
  return { store, ...container };
}
