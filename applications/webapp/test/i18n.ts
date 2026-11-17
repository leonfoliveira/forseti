import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../public/locales/en/translation.json";

const resources = {
  en: {
    translation: en,
  },
};

export async function createTestI18n() {
  const i18n = createInstance();

  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en"],
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
