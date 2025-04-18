// Mematikan peringatan Clerk development key
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('Clerk: Clerk has been loaded with development keys')
    ) {
      return
    }
    originalWarn(...args)
  }
}

// Tambahkan kode aplikasi Next.js
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
