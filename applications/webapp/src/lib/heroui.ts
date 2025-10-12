import { heroui } from "@heroui/react";

const heroUIPlugin = heroui({
  layout: {
    disabledOpacity: "0.3",
    radius: {
      small: "4px",
      medium: "6px",
      large: "8px",
    },
    boxShadow: {
      small: "none",
      medium: "none",
      large: "none",
    },
  },
});

export default heroUIPlugin;
