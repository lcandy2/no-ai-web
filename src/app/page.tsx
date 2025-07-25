'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AIUsageDisplay() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name')
  const hours = searchParams.get('hours')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Weekly AI Usage
        </h1>
        
        {name && hours ? (
          <div className="text-center">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded p-3">
                {name}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Hours (7 days)
              </label>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded p-3">
                {hours}h
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="mb-4">No data provided</p>
            <p className="text-sm">
              Pass data via URL: ?name=YourName&hours=42
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AIUsageDisplay />
    </Suspense>
  )
}
