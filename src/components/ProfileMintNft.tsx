'use client';
import { PenLine } from 'lucide-react';
import { Modal, ModalBody, ModalContent, ModalTrigger } from './AnimatedModal';
import IPFSUploader from './IPFSUploader';

const ProfileMintNft = () => {
  return (
    <Modal>
      <ModalTrigger>
        <PenLine className='cursor-pointer' />
      </ModalTrigger>
      <ModalBody className='max-w-[50%]'>
        <ModalContent>
          <IPFSUploader />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default ProfileMintNft;
