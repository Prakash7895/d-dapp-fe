import React, { FC } from 'react';

interface ButtonProps {
  isLoading?: boolean;
  label: string;
  type?: 'button' | 'submit' | 'reset';
  loadingLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({
  label,
  isLoading,
  type = 'button',
  loadingLabel,
  onClick,
  disabled,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 enabled:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all'
  >
    {isLoading && loadingLabel ? loadingLabel : label}
  </button>
);

export default Button;
