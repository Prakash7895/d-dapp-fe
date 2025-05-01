'use client';

import { Loader2 } from 'lucide-react';
import React, { FC, ReactNode } from 'react';

export interface ButtonProps {
  isLoading?: boolean;
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  loadingLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children?: ReactNode;
  buttonType?: 'primary' | 'secondary';
  className?: string;
}

const Button: FC<ButtonProps> = ({
  label,
  isLoading,
  type = 'button',
  loadingLabel,
  onClick,
  disabled,
  children,
  className = '',
  buttonType = 'primary',
}) => {
  let btnClassName = `group space-x-2 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 enabled:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all ${className}`;

  if (buttonType === 'secondary') {
    btnClassName = `flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors ${className}`;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={btnClassName}
    >
      {isLoading && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
      {label ? (isLoading && loadingLabel ? loadingLabel : label) : children}
    </button>
  );
};

export default Button;
