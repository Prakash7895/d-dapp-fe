'use client';

import React, { FC, ReactNode } from 'react';

interface ITabContenWrapper {
  children: ReactNode;
  className?: string;
}

const TabContenWrapper: FC<ITabContenWrapper> = ({ children, className }) => (
  <div className={`rounded-md bg-gray-900 px-4 py-2 ${className}`}>
    {children}
  </div>
);

export default TabContenWrapper;
