'use client';
import { forwardRef } from 'react';

interface RadioButtonProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    { label, value, checked, onChange, disabled = false, className = '' },
    ref
  ) => {
    return (
      <label
        className={`flex items-center gap-2 cursor-pointer group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className='relative'>
          <input
            ref={ref}
            type='radio'
            value={value}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className='sr-only peer'
          />
          <div
            className={`w-5 h-5 rounded-full border-2 transition-colors
              ${
                checked
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 group-hover:border-gray-200'
              }
              ${disabled ? 'border-gray-200' : ''}
            `}
          >
            {checked && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-2 h-2 rounded-full bg-white' />
              </div>
            )}
          </div>
        </div>
        <span
          className={`text-sm ${
            checked ? 'text-gray-50' : 'text-gray-100 group-hover:text-gray-50'
          }`}
        >
          {label}
        </span>
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';

export default RadioButton;
