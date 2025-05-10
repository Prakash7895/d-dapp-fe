import React, { useRef, useEffect, ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => void; // Callback to fetch more data
  hasMore: boolean; // Whether there is more data to load
  isLoading: boolean; // Whether data is currently being loaded
  direction?: 'top-to-bottom' | 'bottom-to-top'; // Scroll direction
  className?: string; // Additional class names for styling
  style?: React.CSSProperties;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  direction = 'top-to-bottom',
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    };
    const observer = new IntersectionObserver(handleIntersection, {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 1.0, // Trigger when the sentinel is fully visible
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [onLoadMore, hasMore, isLoading, direction]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto h-full ${
        direction === 'bottom-to-top' ? 'flex flex-col-reverse' : ''
      } ${className}`}
      style={style}
    >
      {children}

      <div ref={sentinelRef} className='h-1 w-full' />

      {isLoading && (
        <div className='flex justify-center py-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500'></div>
        </div>
      )}
      {!hasMore && !isLoading && (
        <div className='flex justify-center pb-4'>
          <span className='text-gray-500'>No more data to load</span>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
