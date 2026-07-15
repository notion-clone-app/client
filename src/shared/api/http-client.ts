import { ofetch } from "ofetch";

export const httpClient = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  retry: 0,
  headers: { Accept: "application/json" },
});
