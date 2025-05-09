'use client';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import { FC, ReactNode, useState } from 'react';
import { useStateContext } from './StateProvider';
import NftUploadMint from './NftUploadMint';
import TransactionWrapper from './TransactionWrapper';

interface MintNftModalProps {
  trigger: ReactNode;
  triggerClassName?: string;
  verify?: boolean;
}

const MintNftModal: FC<MintNftModalProps> = ({
  trigger,
  triggerClassName,
  verify,
}) => {
  const [open, setOpen] = useState(false);
  const { getCurrUsersTokenIds, getUpdatedProfileNft } = useStateContext();

  return (
    <Modal open={open} setOpen={setOpen}>
      <TransactionWrapper
        content={(disabled) => (
          <ModalTrigger className={triggerClassName} disabled={disabled}>
            {trigger}
          </ModalTrigger>
        )}
      />
      <ModalBody className='max-w-[50%]'>
        <ModalContent>
          <NftUploadMint
            verify={verify}
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
