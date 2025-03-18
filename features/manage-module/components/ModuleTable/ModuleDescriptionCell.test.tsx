import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModuleDescriptionCell from './ModuleDescriptionCell'
import { Module } from '../../types/module'

// Mock DOMPurify
jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((content) => content),
}))

describe('ModuleDescriptionCell', () => {
  const shortDescription: Module = {
    id: '1',
    title: 'Modul Test',
    description: 'Deskripsi pendek',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const longDescription: Module = {
    id: '2',
    title: 'Modul Test 2',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should render the description without truncation for short descriptions', () => {
    render(<ModuleDescriptionCell module={shortDescription} />)
    
    // Verifikasi deskripsi ditampilkan tanpa tombol "Lihat Selengkapnya"
    expect(screen.getByText('Deskripsi pendek')).toBeInTheDocument()
    expect(screen.queryByText('Lihat Selengkapnya')).not.toBeInTheDocument()
  })

  it('should truncate long descriptions and show "Lihat Selengkapnya" button', () => {
    render(<ModuleDescriptionCell module={longDescription} />)
    
    // Verifikasi deskripsi di-truncate dan tombol "Lihat Selengkapnya" ditampilkan
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument()
    expect(screen.getByText('Lihat Selengkapnya')).toBeInTheDocument()
  })

  it('should expand truncated description when "Lihat Selengkapnya" is clicked', () => {
    render(<ModuleDescriptionCell module={longDescription} />)
    
    // Klik tombol "Lihat Selengkapnya"
    fireEvent.click(screen.getByText('Lihat Selengkapnya'))
    
    // Verifikasi deskripsi lengkap ditampilkan dan tombol berubah menjadi "Sembunyikan"
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument()
    expect(screen.getByText('Sembunyikan')).toBeInTheDocument()
  })

  it('should collapse expanded description when "Sembunyikan" is clicked', () => {
    render(<ModuleDescriptionCell module={longDescription} />)
    
    // Klik tombol "Lihat Selengkapnya" untuk expand
    fireEvent.click(screen.getByText('Lihat Selengkapnya'))
    
    // Klik tombol "Sembunyikan" untuk collapse
    fireEvent.click(screen.getByText('Sembunyikan'))
    
    // Verifikasi deskripsi di-truncate lagi dan tombol kembali menjadi "Lihat Selengkapnya"
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument()
    expect(screen.getByText('Lihat Selengkapnya')).toBeInTheDocument()
  })
})
