import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { defineMessages } from "react-intl";

import { Button } from "@/app/_component/form/button";
import { routes } from "@/config/routes";

const messages = defineMessages({
  home: {
    id: "app._component.page.error-page-template.home",
    defaultMessage: "Home",
  },
});

type Props = {
  code: number;
  description: ReactNode | string;
};

export function ErrorPageTemplate({ code, description }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-8xl font-bold font-mono" data-testid="code">
        {code}
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        {description}
      </h2>
      <Button
        label={messages.home}
        onClick={() => router.push(routes.HOME)}
        className="btn-primary mt-10"
        data-testid="home"
      />
    </div>
  );
}
