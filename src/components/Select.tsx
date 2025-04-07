import React, { ChangeEventHandler } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
}) => {
  return (
    <div className='w-full mb-4'>
      <select
        value={value}
        onChange={onChange}
        className='bg-transparent outline-none px-2 py-1.5 w-full border border-gray-700 rounded-md focus:outline-none'
      >
        <option value='' disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
