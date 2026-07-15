import { FetchError } from "ofetch";
import { httpClient } from "@/shared/api/http-client";
import type { AuthSession } from "../session/auth-session";
import { mapAuthSessionDto, type AuthSessionDto } from "../session/auth-session.dto";
import { RegistrationError, type RegistrationCommand } from "./registration.contracts";

type ErrorResponseDto = { code?: string; message?: string };
type RegistrationRequestDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  appId: number;
};

export async function register(
  command: RegistrationCommand,
  signal?: AbortSignal,
): Promise<AuthSession> {
  try {
    // TODO: configure app id from constants/env
    const body: RegistrationRequestDto = {
      email: command.email,
      password: command.password,
      firstName: command.name,
      lastName: command.lastName,
      appId: 1,
    };
    const dto = await httpClient<AuthSessionDto>("/v1/auth/register", {
      method: "POST",
      body,
      signal: signal ?? null,
      auth: "none",
    });

    return mapAuthSessionDto(dto);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (!(error instanceof FetchError) || !error.response) {
      throw new RegistrationError("Не удалось связаться с сервером", "network");
    }

    const data = error.data as ErrorResponseDto | undefined;
    if (error.status === 409 || data?.code === "EMAIL_TAKEN") {
      throw new RegistrationError("Этот email уже зарегистрирован", "email_taken");
    }
    throw new RegistrationError(data?.message ?? "Не удалось создать аккаунт", "unknown");
  }
}
