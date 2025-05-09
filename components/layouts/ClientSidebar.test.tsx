import { render } from '@testing-library/react'
import { ClientSidebar } from '@/components/layouts/ClientSidebar'
import { useSystemStatus } from '@/features/manage-users/hooks/useSystemStatus'
import * as SidebarModule from './Sidebar'

// Mock Sidebar
jest.mock('./Sidebar', () => ({
  Sidebar: jest.fn(({ systemStatus, securityLevel, networkStatus }) => (
    <div data-testid="mock-sidebar">
      <div>System Status: {systemStatus}</div>
      <div>Security Level: {securityLevel}</div>
      <div>Network Status: {networkStatus}</div>
    </div>
  )),
}))

// Mock the useSystemStatus hook
jest.mock('@/features/manage-users/hooks/useSystemStatus')

describe('ClientSidebar', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  it('passes the correct props to Sidebar component', () => {
    // Setup the mock implementation
    const mockSystemStatus = {
      systemStatus: 85,
      securityLevel: 75,
      networkStatus: 92,
      cpuUsage: 42,
      memoryUsage: 68,
      isLoading: false,
    }

    // Mock the hook to return our test data
    ;(useSystemStatus as jest.Mock).mockReturnValue(mockSystemStatus)

    // Render the component
    render(<ClientSidebar />)

    // Verify the Sidebar component was called with the correct props
    expect(SidebarModule.Sidebar).toHaveBeenCalledWith(
      {
        systemStatus: mockSystemStatus.systemStatus,
        securityLevel: mockSystemStatus.securityLevel,
        networkStatus: mockSystemStatus.networkStatus,
      },
      expect.anything()
    )
  })

  it('handles loading state correctly', () => {
    // Setup the mock implementation with loading state
    const mockSystemStatus = {
      systemStatus: 0,
      securityLevel: 0,
      networkStatus: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      isLoading: true,
    }

    // Mock the hook to return loading state
    ;(useSystemStatus as jest.Mock).mockReturnValue(mockSystemStatus)

    // Render the component
    render(<ClientSidebar />)

    // Verify the Sidebar component was still called with the correct props
    // Even in loading state, the component should receive the systemStatus values
    expect(SidebarModule.Sidebar).toHaveBeenCalledWith(
      {
        systemStatus: mockSystemStatus.systemStatus,
        securityLevel: mockSystemStatus.securityLevel,
        networkStatus: mockSystemStatus.networkStatus,
      },
      expect.anything()
    )
  })

  it('handles hook updates correctly', () => {
    // Initial mock values
    const initialMockStatus = {
      systemStatus: 85,
      securityLevel: 75,
      networkStatus: 92,
      cpuUsage: 42,
      memoryUsage: 68,
      isLoading: false,
    }

    // Mock the hook initially
    ;(useSystemStatus as jest.Mock).mockReturnValue(initialMockStatus)

    // Render the component
    const { rerender } = render(<ClientSidebar />)

    // Verify initial call
    expect(SidebarModule.Sidebar).toHaveBeenCalledWith(
      {
        systemStatus: initialMockStatus.systemStatus,
        securityLevel: initialMockStatus.securityLevel,
        networkStatus: initialMockStatus.networkStatus,
      },
      expect.anything()
    )

    // Updated mock values (simulating hook update)
    const updatedMockStatus = {
      systemStatus: 90,
      securityLevel: 80,
      networkStatus: 95,
      cpuUsage: 45,
      memoryUsage: 70,
      isLoading: false,
    }

    // Update the mock and rerender
    ;(useSystemStatus as jest.Mock).mockReturnValue(updatedMockStatus)

    // Rerender to simulate hook update
    rerender(<ClientSidebar />)

    // Verify the updated props
    expect(SidebarModule.Sidebar).toHaveBeenCalledWith(
      {
        systemStatus: updatedMockStatus.systemStatus,
        securityLevel: updatedMockStatus.securityLevel,
        networkStatus: updatedMockStatus.networkStatus,
      },
      expect.anything()
    )
  })
})
