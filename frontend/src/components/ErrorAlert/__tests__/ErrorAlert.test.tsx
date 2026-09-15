import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorAlert } from "../ErrorAlert";

describe("ErrorAlert", () => {
  it("renders the given message", () => {
    render(<ErrorAlert message="Could not reach the server." onRetry={jest.fn()} />);

    expect(screen.getByText("Could not reach the server.")).toBeInTheDocument();
  });

  it("calls onRetry when the Retry button is clicked", async () => {
    const onRetry = jest.fn();
    render(<ErrorAlert message="Could not reach the server." onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
