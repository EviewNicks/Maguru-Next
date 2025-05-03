'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import Logo from './Navbar/Logo'
import DarkMode from './Navbar/DarkMode'
import CartButton from './Navbar/CartButton'
import NavSearch from './Navbar/NavSearch'
import Container from './Container'
import { LinksDropdown } from './Navbar/LinksDropdown'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Effect untuk deteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? 'bg-background/80 shadow-sm' : 'border-b'
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Menu navigasi desktop */}
          <div className="hidden md:flex items-center">
            <NavSearch />
          </div>

          {/* Tombol aksi di desktop */}
          <div className="hidden md:flex gap-4 items-center">
            <CartButton />
            <DarkMode />
            <LinksDropdown />
          </div>

          {/* Kontrol mobile */}
          <div className="flex items-center gap-4 md:hidden">
            <CartButton />
            <DarkMode />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
        >
          <Container className="py-4 flex flex-col gap-4">
            <NavSearch className="!flex" />
            <div className="flex flex-col gap-2 pt-2 border-t">
              <LinksDropdown />
            </div>
          </Container>
        </motion.div>
      )}
    </header>
  )
}

export default Navbar
