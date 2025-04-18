import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="border-t bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Kolom 1: Tentang */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Tentang Maguru</h3>
            <p className="text-sm text-muted-foreground">
              Platform pembelajaran berbasis gamifikasi dengan pendekatan
              holistik untuk pengembangan hard skills dan soft skills.
            </p>
          </div>

          {/* Kolom 2: Fitur */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Fitur</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/module"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Modul Pembelajaran
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Quiz dan Evaluasi
                </Link>
              </li>
              <li>
                <Link
                  href="/user-dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard Pengguna
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Dukungan */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Dukungan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Kontak Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Legal */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Syarat dan Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Maguru. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
