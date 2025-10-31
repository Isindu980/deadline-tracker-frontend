'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Globe } from 'lucide-react'

export default function NotFound() {
  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-6 text-center">
      <Card className="max-w-md w-full glassmorphism-card border-0 shadow-xl transition-transform hover:scale-[1.02]">
        <CardHeader>
          <div className="flex flex-col items-center gap-3">
            <Globe className="h-14 w-14 text-blue-600 dark:text-blue-400 animate-pulse" />
            <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Oops! Page Not Found
            </CardTitle>
          </div>
          <CardDescription className="mt-3 text-gray-600 dark:text-gray-300">
            It seems the page you’re looking for has drifted away into the digital void.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="glassmorphism border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-md">
            Let’s get you back to somewhere familiar.
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto glassmorphism-button bg-blue-600 hover:bg-blue-700 text-white">
                🏠 Go Home
              </Button>
            </Link>
            <Link href="/dashboard/overview" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto glassmorphism-button">
                📊 Open Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Still can’t find what you need? Double-check the URL or reach out to support.
          </p>
        </CardContent>
      </Card>

      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-6">
        Error 404 — Page Not Found
      </p>
    </div>
  )
}
