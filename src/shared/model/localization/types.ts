import "i18next";
import type common from "./locales/en/landing.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      landing: typeof common;
    };
  }
}
