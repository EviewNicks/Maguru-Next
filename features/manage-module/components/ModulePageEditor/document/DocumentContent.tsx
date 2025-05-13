import { Button } from '@/components/ui/button'
import { Maximize2 } from 'lucide-react'

interface DocumentContentProps {
  title: string
}

export default function DocumentContent({ title }: DocumentContentProps) {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-2xl font-normal">{title}</h1>
      </div>
    </main>
  )
}
