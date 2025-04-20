'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { Loader, X } from 'lucide-react';
import Button from './Button';
import { connectWallet } from '@/contract';
import { cn } from '@/lib/utils';

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
}) => (
  <div className='bg-yellow-500 shadow-lg'>
    <div className='max-w-7xl mx-auto px-4 py-3'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-yellow-900'>{title}</h3>
          <div className='mt-1 text-sm text-yellow-800'>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <Loader className='h-4 w-4 animate-spin' />
                <span>Checking wallet status...</span>
              </div>
            ) : (
              message
            )}
          </div>
          {showEmailRecommendation && (
            <div className='mt-2 p-2 bg-yellow-600/20 rounded-md'>
              <div className='text-sm text-yellow-900'>
                💡 Using a wallet-only account? Add an email address to:
                <ul className='ml-4 mt-1 list-disc'>
                  <li>Sign in from devices without wallet extensions</li>
                  <li>Recover your account if needed</li>
                  <li>Receive important notifications</li>
                </ul>
                <Link
                  href='/profile/security'
                  className='mt-2 inline-flex items-center font-medium underline hover:text-yellow-900'
                >
                  Add email in profile settings →
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {showConnectBtn && (
            <Button
              onClick={connectWallet}
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

export default WalletAlert;
