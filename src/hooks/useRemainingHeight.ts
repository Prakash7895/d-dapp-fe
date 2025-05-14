import { useState, useEffect } from 'react';

const useRemainingHeight = () => {
  const [remainingHeight, setRemainingHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      const alertHandler = document.getElementById('alert-handler');
      const navBar = document.getElementById('nav-bar');

      const alertHandlerHeight = alertHandler?.offsetHeight || 0;
      const navBarHeight = navBar?.offsetHeight || 0;

      const totalHeight = window.innerHeight;
      const calculatedHeight =
        totalHeight - (alertHandlerHeight + navBarHeight);

      setRemainingHeight(calculatedHeight);
    };

    // Initial calculation
    calculateHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);

    // Observe DOM changes to detect when alert-handler is added or removed
    const observer = new MutationObserver(() => {
      calculateHeight();
    });

    const body = document.body;
    observer.observe(body, { childList: true, subtree: true });

    // Cleanup event listener and observer on unmount
    return () => {
      window.removeEventListener('resize', calculateHeight);
      observer.disconnect();
    };
  }, []);

  return remainingHeight;
};

export default useRemainingHeight;
