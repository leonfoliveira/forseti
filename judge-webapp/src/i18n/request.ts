import { getRequestConfig } from "next-intl/server";

import { config } from "@/config/config";

export default getRequestConfig(async () => {
  const locale = config.locale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
