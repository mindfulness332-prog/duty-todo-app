import { render, screen } from "@testing-library/react";
import { DutyList } from "../DutyList";

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
});
