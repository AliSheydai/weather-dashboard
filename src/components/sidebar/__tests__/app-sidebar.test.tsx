import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWeatherStore } from "@/stores/weatherStore";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("AppSidebar - Quick Actions: Refresh Weather", () => {
  const mockFetchAllWeather = jest.fn();
  const mockFetchHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useWeatherStore.setState({
      selectedCity: "Paris",
      current: {
        city: "Paris",
        temperature: 22,
        condition: "Sunny",
        description: "Clear sky",
        humidity: 45,
        windSpeed: 10,
        windDirection: "NW",
        feelsLike: 23,
        visibility: 10,
        uvIndex: 4,
        aqi: 35,
        aqiStatus: "Good",
        rainfall: 0,
        icon: "01d",
        sunrise: "06:30",
        sunset: "20:45",
        sunriseTimestamp: 1724214600,
        sunsetTimestamp: 1724265900,
        timezone: 7200,
      },
      hourly: [],
      daily: [],
      isLoading: false,
      error: null,
      fetchAllWeather: mockFetchAllWeather,
    });

    useAuthStore.setState({
      token: "test-token",
      isAuthenticated: true,
      user: {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        temperatureUnit: "C",
        avatar: null,
        defaultCity: "New York",
      },
      isLoading: false,
    });

    useHistoryStore.setState({
      history: [],
      isLoading: false,
      fetchHistory: mockFetchHistory,
    });
  });

  const renderSidebar = () => {
    return render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );
  };

  it("renders the Refresh Weather button inside Quick Actions", () => {
    renderSidebar();

    const refreshButton = screen.getByRole("button", {
      name: /refresh weather/i,
    });
    expect(refreshButton).toBeInTheDocument();
    expect(screen.getByText("Refresh Weather")).toBeInTheDocument();
  });

  it("triggers fetchAllWeather for currently selected city when clicked", async () => {
    mockFetchAllWeather.mockResolvedValueOnce(undefined);

    renderSidebar();

    const refreshButton = screen.getByRole("button", {
      name: /refresh weather/i,
    });
    fireEvent.click(refreshButton);

    expect(mockFetchAllWeather).toHaveBeenCalledWith("Paris", "test-token");
    expect(mockFetchAllWeather).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText("Updated!")).toBeInTheDocument();
    });

    expect(mockFetchHistory).toHaveBeenCalledWith("test-token");
  });

  it("shows visual loading state and disables button during refresh to prevent multiple requests", async () => {
    let resolveFetch: () => void;
    mockFetchAllWeather.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveFetch = resolve;
        })
    );

    renderSidebar();

    const refreshButton = screen.getByRole("button", {
      name: /refresh weather/i,
    });

    // Click refresh
    fireEvent.click(refreshButton);

    // Should show loading state
    expect(screen.getByText("Refreshing...")).toBeInTheDocument();
    expect(refreshButton).toHaveAttribute("aria-busy", "true");

    // Click again while refreshing - should NOT trigger duplicate fetch
    fireEvent.click(refreshButton);
    expect(mockFetchAllWeather).toHaveBeenCalledTimes(1);

    // Resolve fetch
    await act(async () => {
      resolveFetch!();
    });

    await waitFor(() => {
      expect(screen.getByText("Updated!")).toBeInTheDocument();
    });
  });

  it("handles error gracefully when refresh fails", async () => {
    mockFetchAllWeather.mockImplementation(async () => {
      useWeatherStore.setState({ error: "Network error occurred" });
    });

    renderSidebar();

    const refreshButton = screen.getByRole("button", {
      name: /refresh weather/i,
    });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });
});
