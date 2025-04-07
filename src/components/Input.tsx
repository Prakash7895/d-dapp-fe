import React, { ChangeEventHandler, FC } from 'react';

interface InputProps {
  placeholder?: string;
  value: string | number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  error?: string;
  name: string;
}

const Input: FC<InputProps> = ({
  onChange,
  value,
  placeholder,
  error,
  name,
}) => (
  <div className='flex flex-col'>
    <input
      className='bg-transparent border-[1px] border-gray-700 rounded-md outline-none px-2 py-1 w-full'
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      name={name}
    />
    <small className='h-4 text-red-500 text-left'>{error}</small>
  </div>
);

export default Input;
