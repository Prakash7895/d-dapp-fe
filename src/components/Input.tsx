import React, { ChangeEventHandler, FC } from 'react';

interface InputProps {
  placeholder?: string;
  value: string | number;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const Input: FC<InputProps> = ({ onChange, value, placeholder }) => {
  return (
    <div>
      <input
        className='bg-transparent border-[1px] border-gray-700 rounded-md outline-none px-2 py-1 w-full'
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

export default Input;
