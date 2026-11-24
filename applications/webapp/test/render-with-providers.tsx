import { render, renderHook } from "@testing-library/react";
import { act } from "@testing-library/react";
import { createInstance } from "i18next";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { TooltipProvider } from "@/app/_lib/component/shadcn/tooltip";
import { AppStore, makeStore, RootState } from "@/app/_lib/store/Store";
import { createTestI18n } from "@/test/i18n";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

interface WrapperProps {
  children: React.ReactNode;
  store: AppStore;
  i18n: ReturnType<typeof createInstance>;
}

function Wrapper({ children, store, i18n }: WrapperProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <TooltipProvider>
          <Provider store={store}>{children}</Provider>
        </TooltipProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
}

export async function renderWithProviders(
  component: React.ReactNode,
  preloadedState: Partial<RootState> = {
    contest: MockContestResponseDTO(),
  },
) {
  const store = makeStore(preloadedState);
  const i18n = await createTestI18n();

  const container = await act(async () =>
    render(
      <Wrapper store={store} i18n={i18n}>
        {component}
      </Wrapper>,
    ),
  );

  return { store, i18n, ...container };
}

export async function renderHookWithProviders<T>(
  hook: () => T,
  preloadedState: Partial<RootState> = {},
) {
  const store = makeStore(preloadedState);
  const i18n = await createTestI18n();

  const container = await act(async () =>
    renderHook(hook, {
      wrapper: ({ children }) => (
        <Wrapper store={store} i18n={i18n}>
          {children}
        </Wrapper>
      ),
    }),
  );

  return { store, i18n, ...container };
}
