import { Language } from "@/core/domain/enumerate/Language";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  [Language.CPP_17]: {
    id: "_component.format.formatted-language.cpp_17",
    defaultMessage: "C++ 17",
  },
  [Language.JAVA_21]: {
    id: "_component.format.formatted-language.java_21",
    defaultMessage: "Java 21",
  },
  [Language.PYTHON_3_13]: {
    id: "_component.format.formatted-language.python_3_13",
    defaultMessage: "Python 3.13",
  },
});

export function FormattedLanguage({ language }: { language: Language }) {
  return <FormattedMessage {...messages[language]} />;
}
