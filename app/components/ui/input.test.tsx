import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders label correctly", () => {
    render(<Input label="Username" name="username" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input label="Email" name="email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("border-red-500");
  });

  it("forwards name and id", () => {
    render(<Input name="test-input" id="custom-id" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "test-input");
    expect(input).toHaveAttribute("id", "custom-id");
  });
});
