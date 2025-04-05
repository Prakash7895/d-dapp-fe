'use client';
import { PenLine } from 'lucide-react';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import IPFSUploader from './IPFSUploader';
import { useState } from 'react';

const ProfileMintNft = () => {
  const [open, setOpen] = useState(false);

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
            }}
          />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default ProfileMintNft;
