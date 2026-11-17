import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import enUS from "../public/locales/en-us/translation.json";

const resources = {
  "en-us": {
    translation: enUS,
  },
};

export async function createTestI18n() {
  const i18n = createInstance();

  await i18n.use(initReactI18next).init({
    lng: "en-us",
    fallbackLng: "en-us",
    supportedLngs: ["en-us"],
    lowerCaseLng: true,
    load: "currentOnly",
    defaultNS: "translation",
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
}
