'use client'

import { useState } from 'react'

export default function Home() {  // Changed from APICookbookDemo to Home
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const searchError = async () => {
    setLoading(true)
    try {
      // Call your HelixDB backend
      const response = await fetch('http://localhost:6975/findSolutionsByErrorCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error_code: query })
      })
      
      if (!response.ok) {
        throw new Error('Search request failed')
      }
      
      const data = await response.json()
      setResults(data)
      console.log('Search results:', data)
    } catch (err) {
      console.error('Search failed:', err)
      setResults({ error: 'Search failed. Make sure HelixDB is running on port 6975.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🍳 API Cookbook
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            StackOverflow for APIs • Powered by HelixDB
          </p>
          <p className="text-lg text-gray-500">
            API errors solved in 30 seconds, not 3 hours
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: authentication_error, card_declined, or paste raw error..."
              className="flex-1 p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchError()}
            />
            <button
              onClick={searchError}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '🔍 Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Quick Examples */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {['authentication_error', 'card_declined', 'rate_limit_error', 'parameter_missing'].map(example => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results && !results.error && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">🎯 Solution Found</h2>
            
            {/* Error Info */}
            {results.errors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-800">Error: {results.errors.code}</h3>
                <p className="text-red-700">{results.errors.message}</p>
                <p className="text-red-600 text-sm mt-1">{results.errors.description}</p>
              </div>
            )}

            {/* Solution */}
            {results.solutions?.[0] && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-800 mb-2">
                  💡 {results.solutions[0].title}
                </h3>
                <p className="text-green-700 mb-4">{results.solutions[0].description}</p>
                
                {/* Code Example */}
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">{results.solutions[0].code_example}</pre>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    👍 {results.solutions[0].upvotes} upvotes
                  </span>
                  <a
                    href={results.solutions[0].source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📖 Official Docs
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {results?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-red-800 mb-2">⚠️ Search Failed</h3>
            <p className="text-red-700">{results.error}</p>
            <p className="text-red-600 text-sm mt-2">
              Make sure your HelixDB server is running with: <code className="bg-red-100 px-1 rounded">helix deploy</code>
            </p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">🚀 Production Ready</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">74</div>
                <div className="text-gray-600">Stripe Error Patterns</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">74</div>
                <div className="text-gray-600">Working Solutions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">∞</div>
                <div className="text-gray-600">APIs Possible</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                🔥 <strong>Demo Status:</strong> Live with real Stripe error data • 
                <strong> Response time:</strong> &lt;100ms • 
                <strong> Coverage:</strong> Authentication, payments, webhooks & more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}