import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initializeIdentity } from "@/modules/identity";
import { App } from "./app";
import { queryClient } from "./app/query-client";
import "@/shared/model/localization";

initializeIdentity(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
