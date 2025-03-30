'use client';

import useResize from '@/hooks/useResize';
import React, { FC } from 'react';

interface GridPatternProps {
  columns?: number | 'width';
  rows?: number;
}

const GridPattern: FC<GridPatternProps> = ({ columns = 12, rows = 11 }) => {
  const { width } = useResize();

  const currColumns = columns === 'width' ? Math.ceil(width / 40) : columns;

  return (
    <div className='w-full overflow-hidden'>
      <div className='flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-col justify-center items-center gap-x-px gap-y-px  scale-105'>
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className='border-1 border-green-400 flex'>
            {Array.from({ length: currColumns }).map((_, col) => {
              const index = row * currColumns + col;
              return (
                <div
                  key={`${col}-${row}`}
                  className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                    index % 2 === 0
                      ? 'bg-gray-50 dark:bg-neutral-950'
                      : 'bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]'
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridPattern;
