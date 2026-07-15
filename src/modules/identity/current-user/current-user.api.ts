import { httpClient, type AuthMode } from "@/shared/api/http-client";
import { mapAuthSessionDto, type AuthSessionDto } from "../session/auth-session.dto";
import type { CurrentUser } from "./current-user.entity";

type CurrentUserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type MeDto = AuthSessionDto & {
  user: CurrentUserDto;
};

export async function getCurrentUser(auth: AuthMode = "required") {
  const dto = await httpClient<MeDto>("/v1/auth/me", { auth });
  return {
    user: {
      id: dto.user.id,
      email: dto.user.email,
      firstName: dto.user.firstName,
      lastName: dto.user.lastName,
    } satisfies CurrentUser,
    session: mapAuthSessionDto(dto),
  };
}
