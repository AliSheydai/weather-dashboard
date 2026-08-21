import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCityModal } from "../AddCityModal";
import { useCityModalStore } from "@/stores/cityModalStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useWeatherStore } from "@/stores/weatherStore";
import { useAuthStore } from "@/stores/authStore";
import * as apiConfig from "@/lib/apiConfig";

// Mock apiFetch
jest.mock("@/lib/apiConfig", () => ({
  apiFetch: jest.fn(),
}));

describe("AddCityModal", () => {
  const mockCloseModal = jest.fn();
  const mockOpenModal = jest.fn();
  const mockFetchFavorites = jest.fn();
  const mockAddFavorite = jest.fn();
  const mockRemoveFavorite = jest.fn();
  const mockSetCity = jest.fn();
  const mockFetchAllWeather = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useCityModalStore.setState({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    useFavoritesStore.setState({
      favorites: [
        { id: "fav-1", city: "London", createdAt: "2026-08-21T00:00:00Z" },
        { id: "fav-2", city: "Tokyo", createdAt: "2026-08-21T00:00:00Z" },
      ],
      isLoading: false,
      error: null,
      fetchFavorites: mockFetchFavorites,
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
    });

    useWeatherStore.setState({
      selectedCity: "New York",
      current: null,
      hourly: [],
      daily: [],
      isLoading: false,
      error: null,
      setCity: mockSetCity,
      fetchAllWeather: mockFetchAllWeather,
    });

    useAuthStore.setState({
      token: "test-token",
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User", temperatureUnit: "C" },
      isLoading: false,
    });
  });

  it("does not render when isOpen is false", () => {
    useCityModalStore.setState({ isOpen: false });
    const { container } = render(<AddCityModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders modal header and input when isOpen is true", () => {
    render(<AddCityModal />);
    expect(screen.getByText("Add & Manage Cities")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Search city name (e.g., Paris, Tokyo, Berlin)...")
    ).toBeTruthy();
    expect(screen.getByText("Add City")).toBeTruthy();
  });

  it("renders list of saved cities", () => {
    render(<AddCityModal />);
    expect(screen.getByText("London")).toBeTruthy();
    expect(screen.getByText("Tokyo")).toBeTruthy();
    expect(screen.getByText("2 locations")).toBeTruthy();
  });

  it("renders empty state when there are no saved cities", () => {
    useFavoritesStore.setState({ favorites: [] });
    render(<AddCityModal />);
    expect(screen.getByText("No saved cities yet")).toBeTruthy();
  });

  it("selects a city, refreshes weather, and closes modal on city click", () => {
    render(<AddCityModal />);
    const londonItem = screen.getByText("London");
    fireEvent.click(londonItem);

    expect(mockSetCity).toHaveBeenCalledWith("London");
    expect(mockFetchAllWeather).toHaveBeenCalledWith("London", "test-token");
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("deletes a saved city when clicking trash button", async () => {
    render(<AddCityModal />);
    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveFavorite).toHaveBeenCalledWith("test-token", "fav-1");
    // Ensure clicking trash button doesn't select the city or close modal
    expect(mockSetCity).not.toHaveBeenCalled();
    expect(mockCloseModal).not.toHaveBeenCalled();
  });

  it("shows duplicate error when attempting to add an already saved city", async () => {
    const user = userEvent.setup();
    render(<AddCityModal />);

    const input = screen.getByPlaceholderText(
      "Search city name (e.g., Paris, Tokyo, Berlin)..."
    );
    await user.type(input, "London");
    await user.keyboard("{Enter}");

    expect(
      screen.getByText('"London" is already in your saved cities')
    ).toBeTruthy();
    expect(mockAddFavorite).not.toHaveBeenCalled();
  });

  it("shows error when city is not found by weather API", async () => {
    (apiConfig.apiFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "City not found" }),
    });

    const user = userEvent.setup();
    render(<AddCityModal />);

    const input = screen.getByPlaceholderText(
      "Search city name (e.g., Paris, Tokyo, Berlin)..."
    );
    await user.type(input, "InvalidCityNameXYZ");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText('City "InvalidCityNameXYZ" not found. Please check the spelling.')
      ).toBeTruthy();
    });
    expect(mockAddFavorite).not.toHaveBeenCalled();
  });

  it("validates and successfully adds a new city, shows feedback, and keeps modal open", async () => {
    (apiConfig.apiFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ city: "Paris" }),
    });

    mockAddFavorite.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    render(<AddCityModal />);

    const input = screen.getByPlaceholderText(
      "Search city name (e.g., Paris, Tokyo, Berlin)..."
    ) as HTMLInputElement;

    await user.type(input, "Paris");
    const addButton = screen.getByRole("button", { name: /Add City/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith("test-token", "Paris");
    });

    expect(screen.getByText('"Paris" added to saved cities!')).toBeTruthy();
    expect(input.value).toBe("");
    expect(mockCloseModal).not.toHaveBeenCalled();
  });

  it("closes modal on Close/Done button click or Escape key", () => {
    render(<AddCityModal />);
    const closeBtn = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeBtn);
    expect(mockCloseModal).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockCloseModal).toHaveBeenCalledTimes(2);
  });
});
