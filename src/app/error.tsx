'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-bold">Something went wrong!</CardTitle>
          <CardDescription className="text-center">
            We encountered an unexpected error. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="w-full rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-semibold">Error Details (Development Mode):</p>
              <pre className="mt-1 whitespace-pre-wrap break-all">{error.message}</pre>
              {error.digest && <p className="mt-1 text-xs">Digest: {error.digest}</p>}
            </div>
          )}
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            className="w-full"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
