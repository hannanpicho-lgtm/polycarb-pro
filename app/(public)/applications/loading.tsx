export default function ApplicationsLoading() {
  return (
    <>
      <div className="bg-steel-950 pt-28 pb-14">
        <div className="container mx-auto space-y-4">
          <div
            className="shimmer h-4 w-32 rounded"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <div
            className="shimmer h-12 w-96 rounded"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <div
            className="shimmer h-6 w-2/3 rounded"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        </div>
      </div>
      <div className="bg-background py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-52 rounded-lg border border-border" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
