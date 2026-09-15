import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DutiesPage } from "../DutiesPage";
import * as dutiesApi from "../../services/dutiesApi";
import { ApiError } from "../../services/ApiError";

jest.mock("../../services/dutiesApi", () => ({
  getDuties: jest.fn(),
  createDuty: jest.fn(),
  updateDuty: jest.fn(),
  deleteDuty: jest.fn(),
}));

const mockedApi = dutiesApi as jest.Mocked<typeof dutiesApi>;

describe("DutiesPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it(
    "loads and displays duties, then adds a new one",
    async () => {
      mockedApi.getDuties.mockResolvedValue([{ id: "1", name: "Buy groceries" }]);
      mockedApi.createDuty.mockResolvedValue({ id: "2", name: "Walk the dog" });

      render(<DutiesPage />);

      expect(await screen.findByText("Buy groceries")).toBeInTheDocument();

      await userEvent.type(screen.getByRole("textbox"), "Walk the dog");
      await userEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(await screen.findByText("Walk the dog")).toBeInTheDocument();
    },
    15000,
  );

  it(
    "shows an error alert with a retry action when the initial fetch fails",
    async () => {
      mockedApi.getDuties.mockRejectedValueOnce(
        new ApiError(0, "NETWORK_ERROR", "Could not reach the server."),
      );

      render(<DutiesPage />);

      expect(await screen.findByText("Could not reach the server.")).toBeInTheDocument();

      mockedApi.getDuties.mockResolvedValueOnce([{ id: "1", name: "Buy groceries" }]);
      await userEvent.click(screen.getByRole("button", { name: "Retry" }));

      expect(await screen.findByText("Buy groceries")).toBeInTheDocument();
    },
    15000,
  );
});
