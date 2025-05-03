'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Bell } from 'lucide-react'

function CartButton() {
  // temp
  // const numItemsInCart = 9
  return (
    // <Button
    //   asChild
    //   variant="outline"
    //   size="icon"
    //   className="flex justify-center items-center relative"
    // >
    //   <Link href="/cart">
    //     <AdjustmentsHorizontalIcon className="text-blue-500 w-8 h-8" />
    //     <span className="absolute -top-3 -right-3 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
    //       {numItemsInCart}
    //     </span>
    //   </Link>
    // </Button>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="size-[18px]" />
            <span className="absolute -top-1 -right-1 size-2 bg-primary rounded-full animate-pulse"></span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifikasi</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CartButton
