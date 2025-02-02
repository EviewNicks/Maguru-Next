import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import PublicLogo from "@/public/Logo/Logo-48-Light.png"



function Logo() {
  return <Button variant='link' size='lg' asChild>
    <Link href='/'>
    <Image
  src={PublicLogo}
  alt="Contoh gambar"
  width={104}
  height={36}
  placeholder="blur"
/>
</Link>
  </Button>
}

export default Logo
