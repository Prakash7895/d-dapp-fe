'use client';
import React, { useEffect } from 'react';
import UserNft from './UserNft';
import { useStateContext } from './StateProvider';

const ListUserNfts = () => {
  const { tokedIds, getCurrUsersTokenIds } = useStateContext();

  useEffect(() => {
    getCurrUsersTokenIds();
  }, []);

  return (
    <div className='flex gap-3 flex-wrap'>
      {tokedIds.map((el) => (
        <UserNft key={el} tokenId={el} />
      ))}
    </div>
  );
};

export default ListUserNfts;
