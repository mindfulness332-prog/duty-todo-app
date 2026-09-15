import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DutyItem } from "../DutyItem";
import type { Duty } from "../../../types/duty";

const duty: Duty = { id: "1", name: "Buy groceries" };

describe("DutyItem", () => {
  it("renders the duty name with Edit and Delete actions", () => {
    render(<DutyItem duty={duty} onUpdate={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it(
    "switches to edit mode and calls onUpdate with the new name",
    async () => {
      const onUpdate = jest.fn().mockResolvedValue(undefined);
      render(<DutyItem duty={duty} onUpdate={onUpdate} onDelete={jest.fn()} />);

      await userEvent.click(screen.getByRole("button", { name: "Edit" }));

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("Buy groceries");

      fireEvent.change(input, { target: { value: "Buy groceries and milk" } });
      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onUpdate).toHaveBeenCalledWith("1", "Buy groceries and milk"));
    },
    15000,
  );

  it("returns to view mode without saving when Cancel is clicked", async () => {
    render(<DutyItem duty={duty} onUpdate={jest.fn()} onDelete={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it(
    "asks for confirmation before deleting, then calls onDelete",
    async () => {
      const onDelete = jest.fn().mockResolvedValue(undefined);
      render(<DutyItem duty={duty} onUpdate={jest.fn()} onDelete={onDelete} />);

      await userEvent.click(screen.getByRole("button", { name: "Delete" }));

      expect(onDelete).not.toHaveBeenCalled();
      expect(screen.getByText("Delete this duty?")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Yes, delete" }));

      await waitFor(() => expect(onDelete).toHaveBeenCalledWith("1"));
    },
    15000,
  );
});
