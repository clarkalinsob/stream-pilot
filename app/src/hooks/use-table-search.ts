'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const SEARCH_PARAM = 'search';
const SEARCH_DEBOUNCE_MS = 300;

export function useTableSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get(SEARCH_PARAM)?.trim() ?? '';
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const commitSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) {
        params.set(SEARCH_PARAM, trimmed);
      } else {
        params.delete(SEARCH_PARAM);
      }

      params.delete('page');
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (inputValue.trim() === search) {
      return;
    }

    const timer = window.setTimeout(() => {
      commitSearch(inputValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [inputValue, search, commitSearch]);

  const clearSearch = useCallback(() => {
    setInputValue('');
    commitSearch('');
  }, [commitSearch]);

  return {
    search,
    inputValue,
    setInputValue,
    clearSearch,
  };
}
