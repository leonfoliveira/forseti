import { getRequestConfig } from "next-intl/server";

import { serverConfig } from "@/config/config";

export default getRequestConfig(async () => {
  const locale = serverConfig.locale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
