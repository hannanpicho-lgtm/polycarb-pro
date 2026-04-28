export default function ContactLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-steel-950 pt-28 pb-14">
        <div className="container mx-auto space-y-3">
          <div
            className="shimmer h-4 w-24 rounded"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <div
            className="shimmer h-12 w-80 rounded"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>
      <div className="container mx-auto py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-4">
            <div className="shimmer h-8 w-48 rounded mb-6" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-11 w-full rounded" />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shimmer h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
