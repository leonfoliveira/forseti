import "i18next";

import en from "../../public/locales/en-us/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
    strictKeyChecks: true;
  }
}
