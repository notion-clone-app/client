import type { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AccessDeniedPage, RequireAuth, RequireGuest } from "@/modules/identity";
import { ROUTES } from "@/shared/model";
import { NotFoundPage } from "./not-found.page";
import { RouteErrorPage } from "./route-error.page";

const RouterFallback = () => (
  <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
    Загружаем страницу…
  </main>
);

const routerConfig = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    HydrateFallback: RouterFallback,
    children: [
      {
        path: ROUTES.HOME,
        lazy: () => import("@/modules/marketing/landing.page"),
      },
      {
        path: ROUTES.ARCHITECTURE,
        lazy: () => import("@/modules/marketing/architecture.page"),
      },
      {
        path: ROUTES.BUSINESS_REQUIREMENTS,
        lazy: () => import("@/modules/marketing/requirements.page"),
      },
      {
        Component: RequireGuest,
        children: [
          {
            path: ROUTES.LOGIN,
            lazy: () => import("@/modules/identity/login/login.page"),
          },
          {
            path: ROUTES.REGISTRATION,
            lazy: () => import("@/modules/identity/registration/registration.page"),
          },
        ],
      },
      {
        path: ROUTES.FORBIDDEN,
        Component: AccessDeniedPage,
      },
      {
        Component: RequireAuth,
        children: [
          {
            path: ROUTES.APP,
            lazy: () => import("@/modules/documents/document.page"),
          },
          {
            path: ROUTES.WORKSPACE,
            lazy: () => import("@/modules/workspace/dashboard.page"),
          },
        ],
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);

export const RouterApp: FC = () => <RouterProvider router={routerConfig} />;
