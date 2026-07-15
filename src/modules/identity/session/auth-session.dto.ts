import type { AuthSession } from "./auth-session";

export type AuthSessionDto = {
  accessExpiresAt: number;
};

export function mapAuthSessionDto(dto: AuthSessionDto): AuthSession {
  return {
    accessExpiresAt: dto.accessExpiresAt * 1_000,
  };
}
