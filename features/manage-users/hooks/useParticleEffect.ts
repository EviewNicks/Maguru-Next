import { useEffect, useRef, useState } from 'react'
import { ParticleProps } from '../types'

// Definisikan kelas Particle di luar hook untuk mencegah redefinisi setiap render
class Particle implements ParticleProps {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  canvas: HTMLCanvasElement | null

  constructor(canvas: HTMLCanvasElement | null) {
    this.canvas = canvas
    this.x = Math.random() * (canvas?.width || 0)
    this.y = Math.random() * (canvas?.height || 0)
    this.size = Math.random() * 2 + 1 // Kurangi ukuran
    this.speedX = (Math.random() - 0.5) * 0.2 // Kurangi kecepatan
    this.speedY = (Math.random() - 0.5) * 0.2
    this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.3 + 0.1})` // Kurangi opacity
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    if (this.canvas) {
      if (this.x > this.canvas.width) this.x = 0
      if (this.x < 0) this.x = this.canvas.width
      if (this.y > this.canvas.height) this.y = 0
      if (this.y < 0) this.y = this.canvas.height
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color
    context.beginPath()
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    context.fill()
  }
}

/**
 * Hook untuk mengelola efek partikel animasi di latar belakang
 * dengan optimasi untuk mengurangi impact terhadap React rendering
 */
export function useParticleEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Gunakan useRef untuk animasi frame agar bisa dibersihkan saat unmount
  const animationFrameId = useRef<number | null>(null)
  // Gunakan useRef untuk data yang tidak mempengaruhi render
  const particlesRef = useRef<Particle[]>([])
  // State untuk track apakah animasi sudah diinisialisasi
  const [isInitialized, setIsInitialized] = useState(false)

  // Setup particles dan animasi hanya sekali saat mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitialized) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set ukuran canvas sekali saat inisialisasi
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()

    const particleCount = 50 // Kurangi jumlah partikel untuk performa

    // Inisialisasi partikel hanya sekali
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle(canvas))
      }
    }

    // Fungsi animasi terpisah dari React lifecycle
    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particlesRef.current) {
        particle.update()
        particle.draw(ctx)
      }

      // Gunakan useRef untuk menyimpan ID animasi
      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Mulai animasi
    animate()
    setIsInitialized(true)

    // Event listener untuk resize
    window.addEventListener('resize', resizeCanvas)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      // Cancel animation frame untuk mencegah memory leak
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isInitialized]) // Hanya jalankan sekali

  return canvasRef
}
