import { Skeleton } from '@/components/ui/skeleton'

/**
 * Komponen Loading untuk halaman Manajemen Modul
 * Menampilkan skeleton UI saat halaman sedang loading
 */
export default function ModuleManagementLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Skeleton className="h-10 w-1/4 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      {/* Skeleton untuk DataTable */}
      <div className="border rounded-md">
        {/* Skeleton untuk Search dan Filter */}
        <div className="p-4 flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Skeleton untuk Table Header */}
        <div className="border-t p-2">
          <div className="flex gap-4 p-2">
            <Skeleton className="h-6 w-1/5" />
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-6 w-1/5" />
            <Skeleton className="h-6 w-1/5" />
          </div>
        </div>

        {/* Skeleton untuk Table Rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-t p-2">
            <div className="flex gap-4 p-2">
              <Skeleton className="h-6 w-1/5" />
              <Skeleton className="h-6 w-2/5" />
              <Skeleton className="h-6 w-1/5" />
              <Skeleton className="h-6 w-1/5" />
            </div>
          </div>
        ))}

        {/* Skeleton untuk Pagination */}
        <div className="border-t p-4 flex justify-between items-center">
          <Skeleton className="h-6 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
