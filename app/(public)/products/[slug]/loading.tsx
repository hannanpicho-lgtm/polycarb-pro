export default function ProductDetailLoading() {
  return (
    <>
      <div className="bg-steel-950 pt-24 pb-0">
        <div className="container mx-auto py-4">
          <div
            className="shimmer h-4 w-48 rounded"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
        </div>
      </div>

      <div className="bg-steel-950 pb-10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-10">
          <div
            className="shimmer aspect-[4/3] rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
          <div className="py-4 space-y-4">
            <div
              className="shimmer h-5 w-24 rounded-sm"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div
              className="shimmer h-4 w-40 rounded"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
            <div
              className="shimmer h-10 w-full rounded"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div
              className="shimmer h-4 w-24 rounded"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
            <div
              className="shimmer h-16 w-full rounded"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
            <div
              className="shimmer h-12 w-48 rounded"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
      </div>

      <div className="bg-background py-12">
        <div className="container mx-auto">
          <div className="shimmer h-6 w-48 rounded mb-4" />
          <div className="shimmer h-40 w-full rounded-lg" />
        </div>
      </div>
    </>
  );
}
