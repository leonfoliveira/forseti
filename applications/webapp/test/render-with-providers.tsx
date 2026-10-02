import { act, render, renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";

import { TooltipProvider } from "@/app/_lib/component/shadcn/tooltip";
import { AppStore, makeStore, RootState } from "@/app/_lib/store/Store";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

interface WrapperProps {
  children: React.ReactNode;
  store: AppStore;
}

function Wrapper({ children, store }: WrapperProps) {
  return (
    <TooltipProvider>
      <Provider store={store}>{children}</Provider>
    </TooltipProvider>
  );
}

export async function renderWithProviders(
  component: React.ReactNode,
  preloadedState: Partial<RootState> = {
    contest: MockContestResponseDTO(),
  },
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
