import "./index.css";

import type { FC } from "react";
import { RouterApp } from "./router.provider";
import { ThemeProvider } from "@/shared/theme";

export const App: FC = () => {
  return (
    <ThemeProvider>
      <RouterApp />
    </ThemeProvider>
  );
};
