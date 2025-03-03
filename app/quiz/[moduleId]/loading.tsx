export default function Loading() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <h2 className="text-2xl font-semibold">Mempersiapkan Quiz...</h2>
        <p className="text-muted-foreground mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}
