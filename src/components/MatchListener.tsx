'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { useStateContext } from './StateProvider';
import MatchAnimation from './MatchAnimation';
import { resetMatch } from '@/store/MatchReducer';
import { useAppDispatch, useAppSelector } from '@/store';

const MatchListener: FC<{ children: ReactNode }> = ({ children }) => {
  const { userInfo, fetchMultiSigWallets } = useStateContext();
  const [showMatch, setShowMatch] = useState(false);

  const { matchedWith } = useAppSelector('match');
  console.log('matchedWith:', matchedWith);
  console.log('userInfo?.id:', userInfo?.id);
  console.log('showMatch:', showMatch);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      matchedWith &&
      [matchedWith.userAId, matchedWith.userBId].includes(userInfo!.id)
    ) {
      setShowMatch(true);
    } else {
      setShowMatch(false);
    }
  }, [matchedWith]);

  return (
    <>
      <MatchAnimation
        matchedProfile={matchedWith}
        showMatch={showMatch}
        onClose={() => {
          dispatch(resetMatch());
          fetchMultiSigWallets();
        }}
      />
      {children}
    </>
  );
};

export default MatchListener;
