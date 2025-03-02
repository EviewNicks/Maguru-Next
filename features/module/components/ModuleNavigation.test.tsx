// features/module/components/ModuleNavigation.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModuleNavigation from './ModuleNavigation';

// Mock the Button component from shadcn/ui
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right">ChevronRight</span>,
}));

describe('ModuleNavigation', () => {
  const mockOnPrevPage = jest.fn();
  const mockOnNextPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation buttons correctly', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(2);
    
    expect(buttons[0]).toHaveTextContent('Sebelumnya');
    expect(buttons[1]).toHaveTextContent('Selanjutnya');
    
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <ModuleNavigation
        currentPage={1}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <ModuleNavigation
        currentPage={5}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={true}
      />
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('shows "Selesai" text instead of "Selanjutnya" on last page', () => {
    render(
      <ModuleNavigation
        currentPage={5}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={true}
      />
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons[1]).toHaveTextContent('Selesai');
    expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument();
  });

  it('calls onPrevPage when previous button is clicked', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]);
    expect(mockOnPrevPage).toHaveBeenCalledTimes(1);
  });

  it('calls onNextPage when next button is clicked', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[1]);
    expect(mockOnNextPage).toHaveBeenCalledTimes(1);
  });
});
