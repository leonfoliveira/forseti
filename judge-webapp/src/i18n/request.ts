import { getRequestConfig } from "next-intl/server";

import { env } from "@/config/env";

export default getRequestConfig(async () => {
  const locale = env.LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
