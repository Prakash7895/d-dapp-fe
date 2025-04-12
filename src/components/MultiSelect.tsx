import useClickOutside from '@/hooks/useClickOutside';
import React, { useRef, useState } from 'react';

interface MultiSelectProps {
  label?: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues = [],
  onChange,
  placeholder = 'Add items...',
  className = '',
  hasError,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [hovering, setHovering] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Create refs for the dropdown and input
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the click outside hook
  useClickOutside(
    dropdownRef,
    () => {
      setIsDropdownOpen(false);
    },
    [inputRef]
  );

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleAddItem = (item: string) => {
    if (item.trim() && !selectedValues.includes(item.trim())) {
      onChange([...selectedValues, item.trim()]);
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleRemoveItem = (itemToRemove: string) => {
    onChange(selectedValues.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hovering.trim()) {
      e.preventDefault();
      handleAddItem(hovering);
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedValues.includes(option)) {
      handleRemoveItem(option);
    } else {
      handleAddItem(option);
    }
  };

  const newOption = () => {
    return (
      options.filter(
        (option) => option.toLowerCase() === inputValue.toLowerCase()
      ).length === 0 &&
      selectedValues.filter(
        (option) => option.toLowerCase() === inputValue.toLowerCase()
      ).length === 0
    );
  };

  const errClassName = hasError ? 'border border-red-500' : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-300 mb-1'>
          {label}
        </label>
      )}
      <div className='p-3 bg-gray-800 border border-gray-700 rounded-md'>
        {/* Selected Tags */}
        <div className='flex flex-wrap gap-2 mb-2'>
          {selectedValues.map((value) => (
            <span
              key={value}
              className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800'
            >
              {value}
              <button
                type='button'
                onClick={() => handleRemoveItem(value)}
                className='ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none'
              >
                <span className='sr-only'>Remove {value}</span>×
              </button>
            </span>
          ))}
        </div>

        {/* Input and Options */}
        <div className='relative'>
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errClassName}`}
          />
        </div>

        {/* Options Dropdown */}
        {isDropdownOpen && inputValue && (
          <div
            ref={dropdownRef}
            className='mt-2 max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md'
          >
            {options
              .filter(
                (option) =>
                  option.toLowerCase().includes(inputValue.toLowerCase()) &&
                  !selectedValues.includes(option)
              )
              .map((option, idx) => (
                <div
                  key={option + idx}
                  className={`px-4 py-2 cursor-pointer ${
                    hovering === option ? 'bg-gray-600' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHovering(option)}
                >
                  {option}
                </div>
              ))}
            {newOption() && (
              <div
                onClick={() => handleAddItem(inputValue)}
                className='px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center'
              >
                <button type='button'>Add "{inputValue}"</button>
              </div>
            )}
          </div>
        )}

        {/* Available Options */}
        <div className='mt-2 text-xs text-gray-400'>
          Press Enter to add an item or select from available options
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;
