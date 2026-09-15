import { render, screen } from "@testing-library/react";
import { DutyList } from "../DutyList";

describe("DutyList", () => {
  it("renders the name of each duty", () => {
    render(
      <DutyList
        loading={false}
        duties={[
          { id: "1", name: "Buy groceries" },
          { id: "2", name: "Walk the dog" },
        ]}
      />,
    );

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("shows an empty state message when there are no duties", () => {
    render(<DutyList loading={false} duties={[]} />);

    expect(screen.getByText(/no duties yet/i)).toBeInTheDocument();
  });
});
