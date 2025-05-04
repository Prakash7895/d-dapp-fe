import React, { FC } from 'react';

interface AppNameProps {
  className?: string;
}

const AppName: FC<AppNameProps> = ({ className }) => {
  return (
    <span
      className={`text-2xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent ${className}`}
    >
      ChainMatch
    </span>
  );
};

export default AppName;
