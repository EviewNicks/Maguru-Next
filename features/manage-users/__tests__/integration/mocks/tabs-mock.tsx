import React, { useState } from 'react'

interface TabsMockProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
}

/**
 * Mock untuk komponen Tabs yang digunakan di SystemOverview
 */
export const TabsMock: React.FC<TabsMockProps> = ({
  defaultValue,
  className,
  children,
}) => {
  const [activeTab] = useState(defaultValue)

  // Filter children untuk mencari TabsContent dengan value yang aktif
  const activeContent = React.Children.toArray(children).filter(
    (child) => {
      if (React.isValidElement(child) && child.type === TabsContentMock) {
        const { value } = child.props as { value: string }; // Casting props to the expected type
        return value === activeTab;
      }
      return false;
    }
  )

  // Filter children untuk mencari TabsList (untuk rendering headers)
  const tabList = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === TabsListMock
  )

  return (
    <div className={className} data-testid="tabs-mock">
      {tabList}
      {activeContent}
    </div>
  )
}

interface TabsListMockProps {
  className?: string
  children: React.ReactNode
}

/**
 * Mock untuk TabsList
 */
export const TabsListMock: React.FC<TabsListMockProps> = ({
  className,
  children,
}) => {
  return (
    <div className={className} data-testid="tabs-list-mock">
      {children}
    </div>
  )
}

interface TabsTriggerMockProps {
  value: string
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

/**
 * Mock untuk TabsTrigger
 */
export const TabsTriggerMock: React.FC<TabsTriggerMockProps> = ({
  value,
  className,
  onClick,
  children,
}) => {
  return (
    <button
      className={className}
      data-testid={`tab-trigger-${value}`}
      data-value={value}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface TabsContentMockProps {
  value: string
  className?: string
  children: React.ReactNode
}

/**
 * Mock untuk TabsContent
 */
export const TabsContentMock: React.FC<TabsContentMockProps> = ({
  value,
  className,
  children,
}) => {
  return (
    <div
      className={className}
      data-testid={`tab-content-${value}`}
      data-value={value}
    >
      {children}
    </div>
  )
}
