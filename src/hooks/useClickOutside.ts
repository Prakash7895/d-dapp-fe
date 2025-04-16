'use client';

import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: Handler,
  excludeRefs: RefObject<HTMLElement | null>[] = []
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Check if click is inside any of the excluded refs
      const isExcluded = excludeRefs.some(
        (excludeRef) =>
          excludeRef.current &&
          excludeRef.current.contains(event.target as Node)
      );

      if (isExcluded) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, excludeRefs]);
}

export default useClickOutside;
