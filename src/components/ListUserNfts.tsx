'use client';
import React, { useEffect } from 'react';
import UserNft from './UserNft';
import { useStateContext } from './StateProvider';
import MintNftModal from './MintNftModal';

const ListUserNfts = () => {
  const { tokedIds, getCurrUsersTokenIds } = useStateContext();

  useEffect(() => {
    getCurrUsersTokenIds();
  }, []);

  return (
    <div className='flex gap-3 flex-wrap'>
      {tokedIds.length ? (
        tokedIds.map((el) => <UserNft key={el} tokenId={el} />)
      ) : (
        <div className='flex flex-col items-center justify-center mx-auto gap-4'>
          <p>Mint more NFT's, Its Free</p>
          <MintNftModal
            trigger='Mint Now'
            triggerClassName='text-white bg-primary-500 enabled:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all'
          />
        </div>
      )}
    </div>
  );
};

export default ListUserNfts;
