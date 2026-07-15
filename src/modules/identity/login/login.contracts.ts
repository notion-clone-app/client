export type LoginCommand = Readonly<{
  email: string;
  password: string;
}>;

export class LoginError extends Error {
  readonly code: "invalid_credentials" | "network" | "unknown";

  constructor(message: string, code: LoginError["code"]) {
    super(message);
    this.name = "LoginError";
    this.code = code;
  }
}
