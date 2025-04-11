'use client';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import { FC, ReactNode, useState } from 'react';
import { useStateContext } from './StateProvider';
import NftUploadMint from './NftUploadMint';
import { useWalletContext } from './WalletHandler';

interface MintNftModalProps {
  trigger: ReactNode;
  triggerClassName?: string;
}

const MintNftModal: FC<MintNftModalProps> = ({ trigger, triggerClassName }) => {
  const [open, setOpen] = useState(false);
  const { getCurrUsersTokenIds, getUpdatedProfileNft } = useStateContext();
  const { connected, connectedToValidAddress } = useWalletContext();

  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalTrigger
        className={triggerClassName}
        disabled={!(connected && connectedToValidAddress)}
      >
        {trigger}
      </ModalTrigger>
      <ModalBody className='max-w-[50%]'>
        <ModalContent>
          <NftUploadMint
            onSuccess={() => {
              getUpdatedProfileNft();
              getCurrUsersTokenIds();
              setOpen(false);
            }}
          />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default MintNftModal;
