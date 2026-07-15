import "./index.css";

import type { FC } from "react";
import { IdentityProvider } from "@/modules/identity";
import { RouterApp } from "./router.provider";
import { ThemeProvider } from "@/shared/theme";
import { QueryProvider } from "./query.provider";

export const App: FC = () => {
  return (
    <QueryProvider>
      <IdentityProvider>
        <ThemeProvider>
          <RouterApp />
        </ThemeProvider>
      </IdentityProvider>
    </QueryProvider>
  );
};
