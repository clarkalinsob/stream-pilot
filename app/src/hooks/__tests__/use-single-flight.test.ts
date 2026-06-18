/**
 * @vitest-environment happy-dom
 */
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { useSingleFlight } from '../use-single-flight';

function mountHook<T>(hook: () => T) {
  const result = { current: null as T };
  const container = document.createElement('div');
  let root: Root;

  function TestComponent() {
    result.current = hook();
    return null;
  }

  act(() => {
    root = createRoot(container);
    root.render(createElement(TestComponent));
  });

  return {
    result: result as { current: T },
    unmount: () => act(() => root.unmount()),
  };
}

describe('useSingleFlight', () => {
  it('invokes the handler only once for rapid run calls', async () => {
    let callCount = 0;
    const handler = async () => {
      callCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return 'ok';
    };

    const { result, unmount } = mountHook(() => useSingleFlight(handler));

    await act(async () => {
      const first = result.current.run();
      const second = result.current.run();
      await Promise.all([first, second]);
    });

    expect(callCount).toBe(1);
    unmount();
  });

  it('clears isPending after the handler completes', async () => {
    const handler = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'done';
    };

    const { result, unmount } = mountHook(() => useSingleFlight(handler));

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.isPending).toBe(false);
    unmount();
  });
});
