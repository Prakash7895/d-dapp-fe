import React, { useRef, useEffect, ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => void; // Callback to fetch more data
  hasMore: boolean; // Whether there is more data to load
  isLoading: boolean; // Whether data is currently being loaded
  direction?: 'top-to-bottom' | 'bottom-to-top'; // Scroll direction
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  direction = 'top-to-bottom',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (
      (direction === 'top-to-bottom' &&
        scrollTop + clientHeight >= scrollHeight - 10) || // Near bottom
      (direction === 'bottom-to-top' && scrollTop <= 10) // Near top
    ) {
      onLoadMore();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoading, hasMore]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto h-full ${
        direction === 'bottom-to-top' ? 'flex flex-col-reverse' : ''
      }`}
    >
      {children}
      {isLoading && (
        <div className='flex justify-center py-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500'></div>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
