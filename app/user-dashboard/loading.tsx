import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center">
        {/* Skeleton untuk judul */}
        <Skeleton className="h-12 w-2/3 mb-4" />

        {/* Skeleton untuk deskripsi */}
        <Skeleton className="h-5 w-full max-w-2xl mb-2" />
        <Skeleton className="h-5 w-3/4 max-w-2xl mb-8" />

        {/* Skeleton untuk tombol */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Skeleton untuk kartu fitur */}
        <div className="grid md:grid-cols-3 gap-8 mt-8 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
            >
              <Skeleton className="h-12 w-12 rounded-full mb-4 mx-auto" />
              <Skeleton className="h-6 w-3/4 mb-2 mx-auto" />
              <Skeleton className="h-4 w-full mb-1 mx-auto" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
