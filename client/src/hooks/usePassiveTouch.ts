import { useEffect } from 'react';

export function usePassiveTouch() {
  useEffect(() => {
    const noop = () => {};
    // Add passive listeners so the browser doesn’t wait to block scrolling
    window.addEventListener('touchstart', noop, { passive: true });
    window.addEventListener('touchmove', noop, { passive: true });
    return () => {
      window.removeEventListener('touchstart', noop);
      window.removeEventListener('touchmove', noop);
    };
  }, []);
}
