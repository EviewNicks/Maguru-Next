'use client'
import { Button } from '@/components/ui/button'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

function CartButton() {
  // temp
  const numItemsInCart = 9
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="flex justify-center items-center relative"
    >
      <Link href="/cart">
        <AdjustmentsHorizontalIcon className="text-blue-500 w-8 h-8" />
        <span className="absolute -top-3 -right-3 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
          {numItemsInCart}
        </span>
      </Link>
    </Button>
  )
}
export default CartButton
