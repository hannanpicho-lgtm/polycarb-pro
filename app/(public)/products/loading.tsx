export default function ProductsLoading() {
  return (
    <>
      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto space-y-3">
          <div className="shimmer h-4 w-24 rounded" />
          <div className="shimmer h-12 w-96 rounded" />
          <div className="shimmer h-6 w-64 rounded" />
        </div>
      </div>

      <div className="bg-background/95 border-b border-border py-3">
        <div className="container mx-auto">
          <div className="shimmer h-11 w-full rounded" />
        </div>
      </div>

      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <div className="shimmer aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="shimmer h-5 w-20 rounded-sm" />
                <div className="shimmer h-4 w-32 rounded" />
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-3/4 rounded" />
                <div className="shimmer h-8 w-full rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
