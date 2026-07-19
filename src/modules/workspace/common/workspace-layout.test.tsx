import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { WorkspaceLayout } from "./workspace-layout";

describe("WorkspaceLayout", () => {
  beforeEach(() => localStorage.clear());

  it("resizes the sidebar with the keyboard and persists the preference", () => {
    render(
      <WorkspaceLayout asideNode={<nav>Documents</nav>}>
        <p>Content</p>
      </WorkspaceLayout>,
    );

    const resizer = screen.getByRole("slider", { name: "Resize workspace sidebar" });
    fireEvent.keyDown(resizer, { key: "ArrowRight" });

    expect(resizer).toHaveValue("304");
    expect(localStorage.getItem("workspace:sidebar-width")).toBe("304");
  });
});
