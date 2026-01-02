import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";
import { Button } from "./button";

describe("AlertDialog", () => {
  it("opens when trigger is clicked and calls action", async () => {
    const onAction = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button>Open Alert</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open Alert"));

    expect(await screen.findByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("closes when cancel is clicked", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button>Open Alert</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );

    fireEvent.click(screen.getByText("Open Alert"));
    expect(await screen.findByText("Are you sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    // Wait for it to be removed from the DOM
    // Base UI might take a moment to unmount
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });
});
