import { FetchError } from "ofetch";
import { httpClient } from "@/shared/api/http-client";
import type { Session } from "./session.entity";

type SessionDto = {
  accessExpiresAt: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export async function getSession(): Promise<Session | null> {
  try {
    const dto = await httpClient<SessionDto>("/v1/auth/me");
    return {
      accessExpiresAt: dto.accessExpiresAt * 1_000,
      viewer: {
        id: dto.user.id,
        email: dto.user.email,
        firstName: dto.user.firstName,
        lastName: dto.user.lastName,
      },
    };
  } catch (error) {
    if (error instanceof FetchError && error.status === 401) return null;
    throw error;
  }
}

export async function refreshSession(): Promise<void> {
  await httpClient("/v1/auth/refresh", { method: "POST", auth: "none" });
}

export async function logoutSession(): Promise<void> {
  await httpClient("/v1/auth/logout", { method: "POST" });
}
