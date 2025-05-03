'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { Loader, X } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';
import { useEthereum } from './EthereumProvider';

interface WalletAlertProps {
  title: string;
  message: ReactNode;
  onClose?: () => void;
  isLoading?: boolean;
  showConnectBtn?: boolean;
  showSaveBtn?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  showEmailRecommendation?: boolean;
}

const WalletAlert: FC<WalletAlertProps> = ({
  title,
  message,
  onClose,
  isLoading,
  showConnectBtn,
  showSaveBtn,
  onSave,
  isSaving,
  showEmailRecommendation = true,
}) => {
  const { connect } = useEthereum();
  return (
    <div className='bg-yellow-500 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between gap-4'>
          {showEmailRecommendation ? (
            <div className='flex-1 mt-2 p-2 bg-yellow-600/20 rounded-md'>
              <div className='text-sm text-yellow-900'>
                <p>
                  {`💡 For enhanced security, we recommend adding an email to your account. This ensures that no one else can log in using your wallet on this device. You can also enable 'Email-Only Login' for additional protection.`}
                </p>
                <Link
                  href='/profile/security'
                  prefetch
                  className='mt-2 block items-center font-medium underline hover:text-yellow-900'
                >
                  Add email in profile settings →
                </Link>
              </div>
            </div>
          ) : (
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-yellow-900'>{title}</h3>
              <div className='mt-1 text-sm text-yellow-800'>
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <Loader className='h-4 w-4 animate-spin' />
                    <span>Checking wallet status...</span>
                  </div>
                ) : typeof message === 'string' ? (
                  message
                    .split('\n')
                    .map((line, index) => <p key={index}>{line}</p>)
                ) : (
                  message
                )}
              </div>
            </div>
          )}
          <div className='flex shrink-0 items-center gap-2'>
            {showConnectBtn && (
              <Button
                onClick={connect}
                label='Connect Wallet'
                className={cn(
                  '!w-fit bg-yellow-700 hover:bg-yellow-800 text-white',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
                disabled={isLoading}
              />
            )}
            {showSaveBtn && (
              <Button
                onClick={onSave}
                label={isSaving ? 'Saving...' : 'Save Wallet'}
                className={cn(
                  '!w-fit bg-yellow-700 hover:bg-yellow-800 text-white',
                  (isLoading || isSaving) && 'opacity-50 cursor-not-allowed'
                )}
                disabled={isLoading || isSaving}
                isLoading={isSaving}
              />
            )}
            {onClose && (
              <button
                onClick={onClose}
                className='ml-3 inline-flex rounded-md p-1.5 text-yellow-900 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2'
                disabled={isLoading || isSaving}
              >
                <X className='h-5 w-5' />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAlert;
