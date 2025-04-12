'use client';

import React, { useEffect, useState } from 'react';
import { useStateContext } from './StateProvider';
import { getUserTokenUriById, changeProfileNft } from '@/contract';
import { toast } from 'react-toastify';
import Loader from './Loader';

interface NftItem {
  tokenId: number;
  imageUri: string;
  isActive: boolean;
  loading: boolean;
}

const UserNftGallery: React.FC = () => {
  const { tokedIds, getCurrUsersTokenIds, activeProfilePhoto, getUpdatedProfileNft } = useStateContext();
  const [nfts, setNfts] = useState<NftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Fetch user's NFTs on component mount
  useEffect(() => {
    getCurrUsersTokenIds();
  }, []);

  // Update NFTs when tokenIds change
  useEffect(() => {
    if (tokedIds.length > 0) {
      setLoading(true);
      const fetchNfts = async () => {
        const nftPromises = tokedIds.map(async (tokenId) => {
          const imageUri = await getUserTokenUriById(tokenId);
          return {
            tokenId,
            imageUri: imageUri || '',
            isActive: false,
            loading: false
          };
        });
        
        const nftResults = await Promise.all(nftPromises);
        setNfts(nftResults);
        setLoading(false);
      };
      
      fetchNfts();
    } else {
      setNfts([]);
      setLoading(false);
    }
  }, [tokedIds]);

  // Update active status when activeProfilePhoto changes
  useEffect(() => {
    if (activeProfilePhoto && nfts.length > 0) {
      setNfts(prevNfts => 
        prevNfts.map(nft => ({
          ...nft,
          isActive: nft.imageUri === activeProfilePhoto
        }))
      );
    }
  }, [activeProfilePhoto, nfts.length]);

  const handleSetAsProfile = async (tokenId: number) => {
    setUpdating(tokenId);
    try {
      const success = await changeProfileNft(tokenId);
      if (success) {
        toast.success('Profile photo updated successfully');
        await getUpdatedProfileNft();
      } else {
        toast.error('Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('An error occurred while updating your profile photo');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">No NFTs Found</h3>
        <p className="text-gray-300 mb-4">You haven't minted any NFTs yet.</p>
        <button 
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          onClick={() => window.location.href = '/mint'}
        >
          Mint Your First NFT
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Your NFT Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <div 
            key={nft.tokenId} 
            className={`relative group overflow-hidden rounded-lg border-2 ${
              nft.isActive ? 'border-primary-500' : 'border-gray-700'
            }`}
          >
            {nft.imageUri ? (
              <img 
                src={nft.imageUri} 
                alt={`NFT #${nft.tokenId}`} 
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400">Image not available</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              {nft.isActive ? (
                <div className="bg-primary-500 text-white px-4 py-2 rounded-md">
                  Active Profile Photo
                </div>
              ) : (
                <button
                  onClick={() => handleSetAsProfile(nft.tokenId)}
                  disabled={updating === nft.tokenId}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {updating === nft.tokenId ? (
                    <div className="flex items-center">
                      <Loader />
                      <span className="ml-2">Updating...</span>
                    </div>
                  ) : (
                    'Set as Profile Photo'
                  )}
                </button>
              )}
            </div>
            
            {nft.isActive && (
              <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                Active
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNftGallery; 