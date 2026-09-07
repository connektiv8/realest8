// Placeholder landing page — the real public listing browser still lives in
// the portal app for now. This scaffold exists so /website/ has somewhere to
// grow into once listing pages move out of the portal (see conversation
// notes on the frontend/portal vs website split).
function App() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      <header className="navbar border-b border-base-300 px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">Realest8</span>
        </div>
        <div className="flex-none">
          <a className="btn btn-primary btn-sm" href="http://localhost:5111">
            Vendor Portal
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center py-24">
          <h1 className="text-4xl font-bold mb-4">Affordable homes, straight from vendors</h1>
          <p className="text-lg text-base-content/70 mb-8">
            Properties under $200,000 — or on vendor terms — with a flat $1,000 commission
            per sale. No agent games.
          </p>
          <a className="btn btn-primary" href="http://localhost:5111">
            Browse Listings
          </a>
        </div>
      </main>
    </div>
  )
}

export default App
