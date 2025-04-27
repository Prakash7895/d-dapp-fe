'use client';

import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  isChecked: boolean;
  onToggle: () => void;
  label?: ReactNode;
  disabled?: boolean;
  valueLabel?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  isChecked,
  onToggle,
  label,
  disabled,
  valueLabel,
  className,
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {label && <div className='font-medium text-gray-300'>{label}</div>}
      <div className='flex items-center space-x-2'>
        <span className='text-sm font-medium text-gray-300'>{valueLabel}</span>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300',
            isChecked ? 'bg-primary-500' : 'bg-gray-600',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <motion.div
            layout
            className='h-5 w-5 bg-white rounded-full shadow-md'
            initial={{ x: isChecked ? 26 : 2 }}
            animate={{ x: isChecked ? 26 : 2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </button>
      </div>
    </div>
  );
};

export default Switch;
