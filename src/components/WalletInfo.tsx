'use client';

import React, { useState } from 'react';
import { useStateContext } from './StateProvider';
import { updateWalletAddress } from '@/apiCalls';
import { toast } from 'react-toastify';
import { Loader2, Check, Wallet } from 'lucide-react';

// Define the linked wallet addresses type
interface LinkedWallet {
  address: string;
  isActive: boolean;
}

const WalletInfo: React.FC = () => {
  const { userInfo, setUserInfo, selectedAddress, setSelectedAddress } = useStateContext();
  const [loading, setLoading] = useState<string | null>(null);
  
  // Get linked wallet addresses from userInfo
  // For now, we'll use a placeholder since linkedWalletAddresses is not in the User type
  const linkedWallets: LinkedWallet[] = userInfo?.selectedAddress 
    ? [{ address: userInfo.selectedAddress, isActive: true }] 
    : [];

  const handleSetActiveWallet = async (address: string) => {
    if (!userInfo?.id) return;
    
    setLoading(address);
    try {
      const updatedUser = await updateWalletAddress(+userInfo.id, {
        selectedAddress: address,
      });
      
      if (updatedUser) {
        setUserInfo(updatedUser);
        setSelectedAddress(address);
        toast.success('Wallet address updated successfully');
      } else {
        toast.error('Failed to update wallet address');
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast.error('An error occurred while updating your wallet address');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Wallet Information</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Current Wallet</h3>
        <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 text-primary-500 mr-3" />
            <div>
              <p className="text-white font-medium">Active Wallet</p>
              <p className="text-gray-300 text-sm break-all">
                {selectedAddress || 'No wallet connected'}
              </p>
            </div>
          </div>
          {selectedAddress && (
            <div className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Active
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Linked Wallets</h3>
        {linkedWallets.length > 0 ? (
          <div className="space-y-3">
            {linkedWallets.map((wallet) => (
              <div 
                key={wallet.address} 
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                  <p className="text-gray-300 text-sm break-all">
                    {wallet.address}
                  </p>
                </div>
                <button
                  onClick={() => handleSetActiveWallet(wallet.address)}
                  disabled={loading === wallet.address || wallet.isActive}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    wallet.isActive
                      ? 'bg-primary-500 text-white cursor-default'
                      : 'bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50'
                  }`}
                >
                  {loading === wallet.address ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span>Updating...</span>
                    </div>
                  ) : wallet.isActive ? (
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      <span>Active</span>
                    </div>
                  ) : (
                    'Set as Active'
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-300">No linked wallets found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletInfo; 