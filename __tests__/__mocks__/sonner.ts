// Mock implementasi untuk Sonner
const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  dismiss: jest.fn(),
  custom: jest.fn(),
}

const mockSonner = {
  Toaster: () => null,
  toast,
}

export default mockSonner
