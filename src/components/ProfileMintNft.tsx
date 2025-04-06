'use client';
import { PenLine } from 'lucide-react';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import IPFSUploader from './IPFSUploader';
import { useState } from 'react';
import { useStateContext } from './StateProvider';

const ProfileMintNft = () => {
  const [open, setOpen] = useState(false);
  const { getCurrUsersTokenIds, getUpdatedProfileNft } = useStateContext();

  return (
    <Modal open={open} setOpen={setOpen}>
      <ModalTrigger>
        <PenLine className='cursor-pointer' />
      </ModalTrigger>
      <ModalBody className='max-w-[50%]'>
        <ModalContent>
          <IPFSUploader
            onSuccess={() => {
              setOpen(false);
              getCurrUsersTokenIds();
              getUpdatedProfileNft();
            }}
          />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default ProfileMintNft;
