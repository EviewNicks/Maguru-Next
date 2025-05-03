import Image from 'next/image'

export default function LogosSection() {
  return (
    <section className="w-full py-12 border-y bg-muted/30 ">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Dipercaya oleh institusi pendidikan dan perusahaan teknologi
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <Image
                key={i}
                src={`/Logo/Logo-48-Light.png`}
                alt={`Partner logo ${i}`}
                width={120}
                height={60}
                className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
