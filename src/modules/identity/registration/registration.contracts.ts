export type RegistrationCommand = Readonly<{
  email: string;
  name: string;
  lastName: string;
  password: string;
}>;

export class RegistrationError extends Error {
  readonly code: "email_taken" | "network" | "unknown";

  constructor(message: string, code: RegistrationError["code"]) {
    super(message);
    this.name = "RegistrationError";
    this.code = code;
  }
}
