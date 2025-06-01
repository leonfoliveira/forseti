import { getRequestConfig } from "next-intl/server";
import { config } from "@/app/_config";

export async function getIntlConfig() {
  const locale = config.locale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
}

export default getRequestConfig(getIntlConfig);
