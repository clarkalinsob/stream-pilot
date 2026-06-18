export function singleFlight<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  let inFlight: Promise<TResult> | null = null;

  return (...args: TArgs) => {
    if (inFlight) return inFlight;

    inFlight = fn(...args).finally(() => {
      inFlight = null;
    });

    return inFlight;
  };
}
