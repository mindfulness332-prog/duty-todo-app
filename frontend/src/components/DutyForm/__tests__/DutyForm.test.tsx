import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DutyForm } from "../DutyForm";
import { ApiError } from "../../../services/ApiError";

describe("DutyForm", () => {
  it("renders an input and a submit button with the given label", () => {
    render(<DutyForm submitLabel="Add" onSubmit={jest.fn()} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("shows a validation error and does not call onSubmit for an empty name", async () => {
    const onSubmit = jest.fn();
    render(<DutyForm submitLabel="Add" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error for a name over 200 characters", async () => {
    const onSubmit = jest.fn();
    render(<DutyForm submitLabel="Add" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a".repeat(201) } });
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText(/at most 200 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with the trimmed name and resets the field on success", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<DutyForm submitLabel="Add" onSubmit={onSubmit} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "  Buy groceries  " } });
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Buy groceries"));
    await waitFor(() => expect(input).toHaveValue(""));
  });

  it("shows a server error message and keeps the input value when onSubmit rejects", async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(new ApiError(400, "VALIDATION_ERROR", "name must be unique"));
    render(<DutyForm submitLabel="Add" onSubmit={onSubmit} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Buy groceries" } });
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("name must be unique")).toBeInTheDocument();
    expect(input).toHaveValue("Buy groceries");
  });
});
