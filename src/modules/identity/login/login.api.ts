import { FetchError } from "ofetch";
import { httpClient } from "@/shared/api/http-client";
import type { AuthSession } from "../session/auth-session";
import { mapAuthSessionDto, type AuthSessionDto } from "../session/auth-session.dto";
import { LoginError, type LoginCommand } from "./login.contracts";

type ErrorResponseDto = { message?: string };

export async function login(command: LoginCommand, signal?: AbortSignal): Promise<AuthSession> {
  try {
    const dto = await httpClient<AuthSessionDto>("/v1/auth/login", {
      method: "POST",
      body: command,
      signal: signal ?? null,
    });
    return mapAuthSessionDto(dto);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (!(error instanceof FetchError) || !error.response) {
      throw new LoginError("Не удалось связаться с сервером", "network");
    }

    const data = error.data as ErrorResponseDto | undefined;
    if (error.status === 401) {
      throw new LoginError("Неверный email или пароль", "invalid_credentials");
    }
    throw new LoginError(data?.message ?? "Не удалось войти", "unknown");
  }
}
