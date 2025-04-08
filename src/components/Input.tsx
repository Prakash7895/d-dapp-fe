import React, {
  ChangeEventHandler,
  FC,
  HTMLInputAutoCompleteAttribute,
} from 'react';

interface InputProps {
  placeholder?: string;
  value: string | number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  inputClassName?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  labelClassName?: string;
}

const Input: FC<InputProps> = ({
  onChange,
  value,
  placeholder,
  name,
  label,
  type,
  className,
  inputClassName,
  autoComplete,
  labelClassName,
}) => (
  <div className={className}>
    <label
      htmlFor={name}
      className={`block text-sm font-medium text-gray-300 ${labelClassName}`}
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      autoComplete={autoComplete}
      type={type ?? 'text'}
      required
      className={`appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${inputClassName}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Input;
