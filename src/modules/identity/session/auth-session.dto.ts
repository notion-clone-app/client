import type { AuthSession } from "./auth-session";

export type AuthSessionDto = {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
};

export function mapAuthSessionDto(dto: AuthSessionDto): AuthSession {
  const now = Date.now();

  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    accessExpiresAt: now + dto.accessExpiresIn * 1_000,
    refreshExpiresAt: now + dto.refreshExpiresIn * 1_000,
  };
}
