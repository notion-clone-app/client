import "react-router";

export const ROUTES = {
    HOME: "/",
    ARCHITECTURE: "/architecture",
    BUSINESS_REQUIREMENTS: '/requirements',
    LOGIN: "/login",
    REGISTRATION: "/registration",
} as const;

export type PathParams = {};

declare module "react-router" {
    interface Register {
        params: PathParams;
    }
}