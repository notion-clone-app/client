import { describe, expect, it } from "vitest";
import { registrationFormSchema } from "./registration-form.schema";

const validRegistration = {
  name: "Sergey",
  lastName: "Glotov",
  email: "user@example.com",
  password: "password1",
  passwordConfirmation: "password1",
};

describe("registrationFormSchema", () => {
  it("normalizes names and accepts valid data", () => {
    const result = registrationFormSchema.parse({
      ...validRegistration,
      name: "  Sergey  ",
      lastName: "  Glotov  ",
    });

    expect(result.name).toBe("Sergey");
    expect(result.lastName).toBe("Glotov");
  });

  it("assigns password mismatch to confirmation field", () => {
    const result = registrationFormSchema.safeParse({
      ...validRegistration,
      passwordConfirmation: "different1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.passwordConfirmation).toContain(
        "Пароли не совпадают",
      );
    }
  });
});
