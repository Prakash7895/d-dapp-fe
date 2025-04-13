import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface WalletAlertProps {
  title: string;
  message: ReactNode;
  showProfileLink?: boolean;
  onClose?: () => void;
}

const WalletAlert: FC<WalletAlertProps> = ({
  title,
  message,
  showProfileLink = false,
  onClose,
}) => (
  <div className='bg-yellow-500 shadow-lg'>
    <div className='max-w-7xl mx-auto px-4 py-3'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-yellow-900'>{title}</h3>
          <p className='mt-1 text-sm text-yellow-800'>{message}</p>
          {showProfileLink && (
            <p className='mt-1 text-sm text-yellow-800'>
              To use multiple wallets, please{' '}
              <Link
                href='/profile'
                className='font-medium underline hover:text-yellow-900'
              >
                add your email
              </Link>{' '}
              in your profile settings.
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className='ml-3 inline-flex rounded-md p-1.5 text-yellow-900 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2'
          >
            <X className='h-5 w-5' />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default WalletAlert;
