import { FC } from 'react';
import { Check, X } from 'lucide-react';

interface WalletConfirmDialogProps {
  newAddress: string;
  onConfirm: () => void;
  onCancel: () => void;
  isChecking: boolean;
  error?: string;
}

const WalletConfirmDialog: FC<WalletConfirmDialogProps> = ({
  newAddress,
  onConfirm,
  onCancel,
  isChecking,
  error,
}) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center'>
    <div className='fixed inset-0 bg-black/50' />
    <div className='relative bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
      <h3 className='text-xl font-semibold mb-4'>New Wallet Detected</h3>
      <p className='text-gray-600 dark:text-gray-300 mb-4'>
        Would you like to use this new wallet address with the app?
      </p>
      <p className='text-sm text-gray-500 dark:text-gray-400 mb-6 font-mono'>
        {newAddress.substring(0, 6)}...{newAddress.substring(38)}
      </p>
      
      {error && (
        <div className='mb-4 p-3 bg-red-900 text-red-200 rounded-md text-sm'>
          {error}
        </div>
      )}
      
      <div className='flex justify-end gap-3'>
        <button
          onClick={onCancel}
          className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          disabled={isChecking}
        >
          <X className='h-5 w-5 inline-block mr-1' />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className='px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50'
          disabled={isChecking}
        >
          {isChecking ? (
            'Checking...'
          ) : (
            <>
              <Check className='h-5 w-5 inline-block mr-1' />
              Use This Wallet
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default WalletConfirmDialog; 