'use client';

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
  label: string;
  name: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  name,
  className,
}) => (
  <div className={className}>
    <label htmlFor={name} className='block text-sm font-medium text-gray-300'>
      {label}
    </label>
    <select
      id={name}
      name={name}
      required
      className='appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
      value={value}
      onChange={onChange}
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

export default Select;
