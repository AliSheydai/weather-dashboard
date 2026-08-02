import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchCity } from '../SearchCity';

describe('SearchCity', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search input with placeholder', () => {
    render(<SearchCity onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search for a city or airport');
    expect(input).toBeTruthy();
  });

  it('updates input value on typing', async () => {
    const user = userEvent.setup();
    render(<SearchCity onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search for a city or airport') as HTMLInputElement;
    await user.type(input, 'Berlin');

    expect(input.value).toBe('Berlin');
  });

  it('calls onSearch with trimmed city name on form submit', async () => {
    const user = userEvent.setup();
    render(<SearchCity onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search for a city or airport');
    await user.type(input, '  Berlin  ');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('Berlin');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('does not call onSearch with empty input', async () => {
    const user = userEvent.setup();
    render(<SearchCity onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search for a city or airport');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('does not call onSearch with whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<SearchCity onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search for a city or airport');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('renders the form element', () => {
    const { container } = render(<SearchCity onSearch={mockOnSearch} />);

    const form = container.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('renders search input as text type', () => {
    render(<SearchCity onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search for a city or airport');
    expect(input.getAttribute('type')).toBe('text');
  });
});
