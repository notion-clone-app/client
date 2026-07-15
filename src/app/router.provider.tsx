import { ROUTES } from "@/shared/model";
import type { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

const routerConfig = createBrowserRouter([
  {
    path: ROUTES.HOME,
    lazy: () => import("../features/landing/landing.page"),
  },
  {
    path: ROUTES.ARCHITECTURE,
    lazy: () => import("../features/landing/architecture.page"),
  },
  {
    path: ROUTES.BUSINESS_REQUIREMENTS,
    lazy: () => import("../features/landing/requirements.page"),
  },
  {
    path: ROUTES.LOGIN,
    lazy: () => import("@/modules/identity/login/login.page"),
  },
  {
    path: ROUTES.REGISTRATION,
    lazy: () => import("@/modules/identity/registration/registration.page"),
  },
]);

export const RouterApp: FC = () => {
  return <RouterProvider router={routerConfig} />;
};
