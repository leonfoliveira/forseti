import { Button } from "@/app/_component/form/button";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  code: number;
  description: string;
};

export function ErrorPageTemplate({ code, description }: Props) {
  const router = useRouter();
  const t = useTranslations("_component.error-page");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-8xl font-bold font-mono" data-testid="code">
        {code}
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        {description}
      </h2>
      <Button
        onClick={() => router.push(routes.HOME)}
        className="btn-primary mt-10"
        data-testid="home"
      >
        {t("home:label")}
      </Button>
    </div>
  );
}
