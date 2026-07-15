import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("connects its label and accepts user input", async () => {
    const user = userEvent.setup();

    render(<Input labelContent="Email" name="email" type="email" />);

    const input = screen.getByRole("textbox", { name: "Email" });
    await user.type(input, "user@example.com");

    expect(input).toHaveValue("user@example.com");
  });

  it("exposes validation errors to assistive technologies", () => {
    render(<Input labelContent="Email" name="email" hasErrors messages="Enter a valid email" />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleErrorMessage("Enter a valid email");
  });
});
