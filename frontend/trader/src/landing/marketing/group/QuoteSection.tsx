import ImagePlaceholder from '../ui/ImagePlaceholder'

export default function QuoteSection() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <ImagePlaceholder label="Marc Bürki" className="w-full aspect-[4/5]" />
          </div>

          <div className="lg:col-span-7">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight leading-[1.1] text-gray-900">
              &quot;SetupFX combines a unique multi-asset class trading platform with the
              innovative power of a fintech company based on a solid Swiss bank.&quot;
            </blockquote>
            <p className="mt-6 text-sm text-gray-600">Marc Bürki, Co-founder and CEO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
