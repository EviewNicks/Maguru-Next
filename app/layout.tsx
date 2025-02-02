import type { Metadata } from 'next'
import { Inter, Playfair_Display, Fira_Code } from 'next/font/google'
import '@/styles/globals.css'
import Navbar from '@/components/layouts/Navbar'
import Container from '@/components/layouts/Container'
import Providers from '@/config/providers'
import { ClerkProvider, SignInButton, SignedOut } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})
const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

export const metadata: Metadata = {
  title: 'Maguru Project',
  description: 'Modul Pembelajaran Hard Skill dan Soft Skill',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${playfair.variable} ${firaCode.variable} antialiased`}
        >
          <Providers>
            <Navbar />
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <Container className="py-20">{children}</Container>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
