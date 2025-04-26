'use client' // Error components must be Client Components
 
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
 
interface ErrorBoundaryProps {
    error: Error & { digest?: string }
    reset: () => void
}
 
export default function Error({
    error,
    reset,
}: ErrorBoundaryProps) {
 
    useEffect(() => {
        // simulate logging the error
        Sentry.captureException(error)
    }, [error])
 
    return (
        <>
            <h1>Sorry, something went wrong 😞</h1>
            <button
                onClick={() => {
                    // attempt to recover by trying to re-render the segment
                    reset()
                }}
            >
                Try again
            </button>
        </>
    )
}