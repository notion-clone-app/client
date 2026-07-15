import { FetchError, ofetch, type FetchOptions, type FetchRequest } from "ofetch";

export type AuthMode = "none" | "optional" | "required";

export type HttpAuthMiddleware = Readonly<{
  prepare: (mode: Exclude<AuthMode, "none">) => Promise<void>;
  recoverUnauthorized: () => Promise<boolean>;
}>;

type HttpOptions = FetchOptions<"json"> & {
  auth?: AuthMode;
};

const transport = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  credentials: "include",
  retry: 0,
  headers: { Accept: "application/json" },
});

let authMiddleware: HttpAuthMiddleware | null = null;

export function configureHttpAuth(middleware: HttpAuthMiddleware): () => void {
  authMiddleware = middleware;

  return () => {
    if (authMiddleware === middleware) authMiddleware = null;
  };
}

export async function httpClient<T>(request: FetchRequest, options: HttpOptions = {}): Promise<T> {
  const { auth = "required", ...fetchOptions } = options;

  if (auth !== "none") await authMiddleware?.prepare(auth);

  try {
    return await transport<T>(request, fetchOptions);
  } catch (error) {
    const middleware = authMiddleware;
    const shouldRecover =
      auth !== "none" && error instanceof FetchError && error.status === 401 && middleware;

    if (!shouldRecover || !(await middleware.recoverUnauthorized())) throw error;

    return transport<T>(request, fetchOptions);
  }
}
