import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/app/_i18n/messages/en.json";

const WithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions,
) =>
  render(ui, {
    wrapper: (props) => <WithProviders {...props} />,
    ...options,
  });
