import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<Button isLoading>Submit</Button>);
    // The spinner is a span with animate-spin class
    const spinner = screen.getByRole("button").querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");

    rerender(<Button variant="ghost">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-zinc-600");
  });
});
