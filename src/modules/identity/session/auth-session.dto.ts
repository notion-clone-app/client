import type { AuthSession } from "./auth-session";

export type AuthSessionDto = {
  accessExpiresIn: number;
};

export function mapAuthSessionDto(dto: AuthSessionDto): AuthSession {
  return {
    accessExpiresAt: Date.now() + dto.accessExpiresIn * 1_000,
  };
}
