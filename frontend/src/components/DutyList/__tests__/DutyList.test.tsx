import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DutyList } from "../DutyList";
import type { Duty } from "../../../types/duty";

const noopUpdate = jest.fn();
const noopDelete = jest.fn();

describe("DutyList", () => {
  it("renders the name of each duty", () => {
    render(
      <DutyList
        loading={false}
        duties={[
          { id: "1", name: "Buy groceries" },
          { id: "2", name: "Walk the dog" },
        ]}
        onUpdate={noopUpdate}
        onDelete={noopDelete}
      />,
    );

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("shows an empty state message when there are no duties", () => {
    render(<DutyList loading={false} duties={[]} onUpdate={noopUpdate} onDelete={noopDelete} />);

    expect(screen.getByText(/no duties yet/i)).toBeInTheDocument();
  });

  it("keeps each row's identity stable by id when the list shrinks mid-edit", () => {
    // Regression test: without `rowKey="id"` on the underlying antd List,
    // removing an earlier item shifts every later item's array index. antd
    // then reuses each DutyItem's component instance by position instead of
    // by duty, so an item mid-edit keeps rendering under the new occupant of
    // its old index — surfacing as another duty appearing "stuck" in edit
    // mode with a stale name. Saving in that state would silently rename the
    // wrong duty.
    function Harness() {
      const [duties, setDuties] = useState<Duty[]>([
        { id: "A", name: "Duty A" },
        { id: "B", name: "Duty B" },
        { id: "C", name: "Duty C" },
      ]);
      return (
        <div>
          <button onClick={() => setDuties((prev) => prev.filter((d) => d.id !== "A"))}>
            remove-A
          </button>
          <DutyList duties={duties} loading={false} onUpdate={noopUpdate} onDelete={noopDelete} />
        </div>
      );
    }

    render(<Harness />);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const editDutyB = editButtons[1];
    if (!editDutyB) {
      throw new Error("expected an Edit button for Duty B");
    }
    fireEvent.click(editDutyB);
    expect(screen.getByRole("textbox")).toHaveValue("Duty B");

    fireEvent.click(screen.getByRole("button", { name: "remove-A" }));

    // B is still the one being edited; C must render as plain text, unaffected,
    // not as a second edit form carrying B's stale value.
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.getByRole("textbox")).toHaveValue("Duty B");
    expect(screen.getByText("Duty C")).toBeInTheDocument();
  });
});
