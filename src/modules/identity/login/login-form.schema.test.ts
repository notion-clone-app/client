import { describe, expect, it } from "vitest";
import { loginFormSchema } from "./login-form.schema";

describe("loginFormSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginFormSchema.safeParse({ email: "user@example.com", password: "secret" }).success,
    ).toBe(true);
  });

  it("rejects invalid email and empty password", () => {
    const result = loginFormSchema.safeParse({ email: "invalid", password: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });
});
