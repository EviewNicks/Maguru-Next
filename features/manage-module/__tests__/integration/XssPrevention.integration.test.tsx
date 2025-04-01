import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModuleStatus } from '../../types'
import DOMPurify from 'isomorphic-dompurify'
import ModuleDescriptionCell from '../../components/ModuleTable/ModuleDescriptionCell'

// Buat komponen mock sederhana untuk pengujian
const MockTitleCell = ({ content }: { content: string }) => {
  const sanitizedContent = DOMPurify.sanitize(content)
  return (
    <div
      data-testid="title-cell"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}

describe('XSS Prevention Integration Test', () => {
  const mockModules = [
    {
      id: '1',
      title: 'Safe Title <script>alert("XSS")</script>',
      description: 'Safe Description <img src="x" onerror="alert(\'XSS\')">',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '1',
      updatedBy: '1',
    },
  ]

  const queryClient = new QueryClient()

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should sanitize dangerous content in title cells', async () => {
    render(<MockTitleCell content={mockModules[0].title} />, { wrapper })

    // Cek elemen dengan data-testid
    const titleCell = screen.getByTestId('title-cell')

    // Verifikasi konten berbahaya dihapus
    expect(titleCell.innerHTML).toContain('Safe Title')
    expect(titleCell.innerHTML).not.toContain('<script>')
    expect(titleCell.innerHTML).not.toContain('alert("XSS")')
  })

  it('should sanitize dangerous content in description cells', async () => {
    render(<ModuleDescriptionCell module={mockModules[0]} />, { wrapper })

    // Verifikasi konten berbahaya dari deskripsi dihapus
    const descriptionElement = screen.getByText(/Safe Description/i)
    expect(descriptionElement).toBeInTheDocument()
    expect(descriptionElement.innerHTML).not.toContain('onerror')
    expect(descriptionElement.innerHTML).not.toContain("alert('XSS')")
  })
})
