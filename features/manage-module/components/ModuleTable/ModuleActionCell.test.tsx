import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModuleActionCell from './ModuleActionCell'
import { Module } from '../../types/module'
import { toast } from 'sonner'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock dialog
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('ModuleActionCell', () => {
  const mockModule: Module = {
    id: '1',
    title: 'Modul Test',
    description: 'Deskripsi test',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render edit and delete buttons', () => {
    render(
      <ModuleActionCell 
        module={mockModule} 
      />
    )
    
    // Verifikasi tombol edit dan delete ditampilkan
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Hapus')).toBeInTheDocument()
  })

  it('should call toast.info when edit button is clicked', () => {
    render(
      <ModuleActionCell 
        module={mockModule} 
      />
    )
    
    // Klik tombol edit
    fireEvent.click(screen.getByText('Edit'))
    
    // Verifikasi toast.info dipanggil dengan pesan yang benar
    expect(toast.info).toHaveBeenCalledWith(`Edit modul: ${mockModule.title}`)
  })

  it('should call toast.info when delete button is clicked', () => {
    render(
      <ModuleActionCell 
        module={mockModule} 
      />
    )
    
    // Klik tombol delete
    fireEvent.click(screen.getByText('Hapus'))
    
    // Verifikasi toast.info dipanggil dengan pesan yang benar
    expect(toast.info).toHaveBeenCalledWith(`Hapus modul: ${mockModule.title}`)
  })
})
