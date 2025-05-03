import Image from 'next/image'
import Link from 'next/link'
import PublicLogo from '@/public/Logo/Logo-48-Light.png'

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold">
      <div className="flex items-center justify-center">
        <Image
          src={PublicLogo}
          alt="Maguru Logo"
          width={104}
          height={36}
          placeholder="blur"
          className="transition-all"
        />
      </div>
    </Link>
  )
}

export default Logo
