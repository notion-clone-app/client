import "./index.css";

import type { FC } from "react";
import { RouterApp } from "./router.provider";
import { ThemeProvider } from "@/shared/theme";
import { QueryProvider } from "./query.provider";

export const App: FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RouterApp />
      </ThemeProvider>
    </QueryProvider>
  );
};
