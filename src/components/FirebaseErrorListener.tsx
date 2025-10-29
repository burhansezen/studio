'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A client component that listens for Firestore permission errors
 * and displays a toast notification. This component is meant to be used
 * within the main layout to provide global error handling.
 *
 * It ONLY runs in a development environment.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    // This effect should only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleError = (error: any) => {
      console.error('Firestore Permission Error:', error);

      // We re-throw the error to make it visible in the Next.js dev overlay
      // This provides a clearer, more immediate feedback loop during development
      // compared to just showing a toast. The toast is a good secondary indicator.
      throw new Error(
        `FirebaseError: Missing or insufficient permissions: ${error.message}`
      );
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // This component does not render anything itself
  return null;
}
