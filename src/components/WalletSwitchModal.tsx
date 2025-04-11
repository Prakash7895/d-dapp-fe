import { FC } from 'react';
import Link from 'next/link';

interface WalletSwitchModalProps {
  title: string;
  message: string;
  showProfileLink?: boolean;
}

const WalletSwitchModal: FC<WalletSwitchModalProps> = ({
  title,
  message,
  showProfileLink = false,
}) => (
  <div className='fixed inset-0 z-[51] flex items-center justify-center'>
    <div className='fixed inset-0 bg-black/50' />
    <div className='relative bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4'>
      <h3 className='text-xl font-semibold mb-4'>{title}</h3>
      <p className='text-gray-600 dark:text-gray-300 mb-4'>{message}</p>

      {showProfileLink && (
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          To use multiple wallets, please{' '}
          <Link
            href='/profile'
            className='text-primary-400 hover:text-primary-300 underline'
          >
            add your email
          </Link>{' '}
          in your profile settings.
        </p>
      )}
    </div>
  </div>
);

export default WalletSwitchModal;
