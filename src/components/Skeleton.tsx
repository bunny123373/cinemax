export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[150px] lg:w-[170px]">
      <div className="aspect-[2/3] skeleton" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <section className="relative">
      <div className="mb-4 px-4 md:px-8">
        <div className="h-7 w-40 skeleton" />
      </div>
      <div className="flex gap-3 px-4 md:px-8 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] skeleton" />
  );
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] space-y-6 px-6 max-w-[1800px] mx-auto pt-24">
      <SkeletonHero />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
