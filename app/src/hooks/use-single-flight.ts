'use client';

import { useCallback, useRef, useState } from 'react';

export function useSingleFlight<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const inFlightRef = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(
    async (...args: TArgs) => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setIsPending(true);

      try {
        return await fn(...args);
      } finally {
        inFlightRef.current = false;
        setIsPending(false);
      }
    },
    [fn],
  );

  return { run, isPending };
}
