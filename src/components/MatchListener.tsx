'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { useStateContext } from './StateProvider';
import MatchAnimation from './MatchAnimation';
import { useAppSelector } from '@/store';
import { useAppDispatch } from './Chat/ChatProvider';
import { resetMatch } from '@/store/MatchReducer';

const MatchListener: FC<{ children: ReactNode }> = ({ children }) => {
  const { userInfo, fetchMultiSigWallets } = useStateContext();
  const [showMatch, setShowMatch] = useState(false);

  const { matchedWith } = useAppSelector('match');
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      matchedWith &&
      [matchedWith.userAId, matchedWith.userBId].includes(userInfo?.id!)
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
