import { useCallback } from 'react';
import { STORAGE_KEYS } from '@/config/site';
import { isStringArray } from '@/utils/storage';
import { useLocalStorage } from './useLocalStorage';

const LIMIT = 16;

export function useRecentlyViewed() {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEYS.recentlyViewed, [], isStringArray);
  const track = useCallback((id: string) => setIds((list) => [id, ...list.filter((x) => x !== id)].slice(0, LIMIT)), [setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  return { ids, track, clear };
}

export function useRecentSearches() {
  const [terms, setTerms] = useLocalStorage<string[]>(STORAGE_KEYS.recentSearches, [], isStringArray);
  const add = useCallback(
    (term: string) => {
      const clean = term.trim().slice(0, 60);
      if (clean.length < 2) return;
      setTerms((list) => [clean, ...list.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6));
    },
    [setTerms],
  );
  const clear = useCallback(() => setTerms([]), [setTerms]);
  return { terms, add, clear };
}
