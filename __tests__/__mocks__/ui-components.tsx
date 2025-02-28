// Mock untuk Button
export const Button = ({ children, ...props }: any) => (
  <button data-testid="mock-Button" {...props}>
    {children}
  </button>
)

// Mock untuk DropdownMenu components
export const DropdownMenu = ({ children }: any) => (
  <div data-testid="mock-DropdownMenu">{children}</div>
)

export const DropdownMenuTrigger = ({ children }: any) => (
  <div data-testid="mock-DropdownMenuTrigger">{children}</div>
)

export const DropdownMenuContent = ({ children }: any) => (
  <div data-testid="mock-DropdownMenuContent">{children}</div>
)

export const DropdownMenuItem = ({ children, ...props }: any) => (
  <div data-testid="mock-DropdownMenuItem" {...props}>
    {children}
  </div>
)

// Mock untuk icons
export const SunIcon = () => <div data-testid="hero-icon-SunIcon" />
export const MoonIcon = () => <div data-testid="hero-icon-MoonIcon" />
export const LaptopIcon = () => <div data-testid="hero-icon-LaptopIcon" />
