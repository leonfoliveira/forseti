import { getRequestConfig } from "next-intl/server";
import { env } from "@/config/env";

export async function getIntlConfig() {
  const locale = env.LOCALE;

  return {
    locale,
    timeZone: "GMT",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
}

export default getRequestConfig(getIntlConfig);
