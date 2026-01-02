import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./dialog";
import { Button } from "./button";

describe("Dialog", () => {
  it("opens when trigger is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger render={<Button>Open Dialog</Button>} />
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog Content</p>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open Dialog"));

    expect(await screen.findByText("Dialog Title")).toBeInTheDocument();
    expect(screen.getByText("Dialog Content")).toBeInTheDocument();
  });
});
