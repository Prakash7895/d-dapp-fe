'use client';
import {
  useMatchMakingContract,
  useEthereum,
  useSoulboundNFTContract,
} from '@/components/EthereumProvider';
import { formatEther, parseEther } from 'ethers';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit2,
  Lock,
  AlertCircle,
  Shield,
  AlertTriangle,
  HeartHandshake,
  Image,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/AnimatedModal';
import Button from '@/components/Button';
import ScreenLoader from '@/components/ScreenLoader';

interface ContractState {
  // MatchMaking Contract
  amount: string;
  owner: string;
  expirationDays: number;
  commission: number;
  // SoulboundNFT Contract
  nftOwner: string;
  mintFee: string;
  isLoading: boolean;
  balanceMatchMaking: string;
  balanceSoulboundNft: string;
  matchMakingMaxAmountCanWithdraw: string;
}

const enum ActiveFields {
  TRANSFER = 'transfer',
  AMOUNT = 'amount',
  EXPIRATION_DAYS = 'expirationDays',
  MINT_FEE = 'mintFee',
  COMMISSION = 'commission',
}

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
    rotate: 0,
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const AdminPage = () => {
  const { address, provider, connect } = useEthereum();
  const matchMakingContract = useMatchMakingContract();
  const soulboundNftContract = useSoulboundNFTContract();

  const [state, setState] = useState<ContractState>({
    amount: '0',
    owner: '',
    expirationDays: 0,
    isLoading: true,
    mintFee: '',
    nftOwner: '',
    commission: 0,
    balanceMatchMaking: '',
    balanceSoulboundNft: '',
    matchMakingMaxAmountCanWithdraw: '',
  });
  const [newValues, setNewValues] = useState({
    [ActiveFields.AMOUNT]: '',
    [ActiveFields.EXPIRATION_DAYS]: '',
    [ActiveFields.MINT_FEE]: '',
    [ActiveFields.COMMISSION]: '',
    [ActiveFields.TRANSFER]: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveFields | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = address?.toLowerCase() === state.owner?.toLowerCase();

  useEffect(() => {
    connect();
  }, []);

  const fetchContractState = async () => {
    if (!matchMakingContract || !soulboundNftContract) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const [
        amount,
        owner,
        expirationDays,
        s_commission,
        s_maxAmountCanWithdraw,
        balanceMatchMaking,
        nftOwner,
        mintFee,
        balanceSoulboundNft,
      ] = await Promise.all([
        // MatchMaking Contract
        matchMakingContract.s_amount(),
        matchMakingContract.s_owner(),
        matchMakingContract.s_likeExpirationDays(),
        matchMakingContract.s_commission(),
        matchMakingContract.s_maxAmountCanWithdraw(),
        provider?.getBalance(process.env.NEXT_PUBLIC_MATCH_MAKING_ADDRESS!),
        // SoulboundNFT Contract
        soulboundNftContract.s_owner(),
        soulboundNftContract.s_mintFee(),
        provider?.getBalance(process.env.NEXT_PUBLIC_SOULBOUND_NFT_ADDRESS!),
      ]);

      setState({
        amount: formatEther(amount),
        owner,
        expirationDays: Number(expirationDays),
        commission: s_commission,
        nftOwner,
        mintFee: formatEther(mintFee),
        isLoading: false,
        balanceMatchMaking: formatEther(balanceMatchMaking!),
        balanceSoulboundNft: formatEther(balanceSoulboundNft!),
        matchMakingMaxAmountCanWithdraw: formatEther(s_maxAmountCanWithdraw),
      });
    } catch (error) {
      console.log('Error fetching contract state:', error);
      toast.error('Failed to fetch contract state');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (matchMakingContract && soulboundNftContract) {
      fetchContractState();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [matchMakingContract, soulboundNftContract]);

  const handleUpdate = async (field: ActiveFields) => {
    if (!matchMakingContract || !soulboundNftContract || !isOwner) return;

    try {
      let tx;
      setIsUpdating(true);
      if (field === ActiveFields.AMOUNT) {
        tx = await matchMakingContract.setAmount(parseEther(newValues.amount));
      } else if (field == ActiveFields.EXPIRATION_DAYS) {
        tx = await matchMakingContract.setLikeExpirationDays(
          Number(newValues.expirationDays)
        );
      } else if (field === ActiveFields.MINT_FEE) {
        tx = await soulboundNftContract.setAmount(
          parseEther(newValues.mintFee)
        );
      } else if (field === ActiveFields.COMMISSION) {
        tx = await matchMakingContract.setCommission(
          Number(newValues.commission)
        );
      }
      await tx.wait();
      await fetchContractState();
      setNewValues((prev) => ({ ...prev, [field]: '' }));
      toast.success(`Successfully updated ${field}`);
    } catch (error: any) {
      console.log(`Error updating ${field}:`, error);
      console.log('MESSAGE', error.message);
      toast.error(`Failed to update ${field}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenModal = (field: ActiveFields) => {
    if (field !== ActiveFields.TRANSFER) {
      setNewValues((p) => ({ ...p, [field]: state[field] }));
    }
    setActiveField(field);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!activeField) return;
    await handleUpdate(activeField);
    setIsModalOpen(false);
    setActiveField(null);
  };

  const handleTransferToOwner = async (amount: string) => {
    if (!matchMakingContract || !isOwner) return;

    try {
      setIsUpdating(true);
      const tx = await matchMakingContract.transferToOwner(parseEther(amount));
      await tx.wait();
      await fetchContractState(); // Refresh contract state
      toast.success('Successfully transferred funds to owner');
      setIsModalOpen(false);
    } catch (error: any) {
      console.log('Error transferring funds:', error);
      toast.error('Failed to transfer funds');
    } finally {
      setIsUpdating(false);
    }
  };

  if (state.isLoading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <ScreenLoader />
      </div>
    );
  }

  if (!matchMakingContract || !soulboundNftContract) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-8'>
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 0 }}
          className='bg-gray-800 rounded-lg p-8 max-w-md w-full text-center'
        >
          <AlertCircle className='w-12 h-12 text-yellow-500 mx-auto mb-4' />
          <h2 className='text-xl font-bold text-white mb-2'>
            Contracts Not Deployed
          </h2>
          <p className='text-gray-400 mb-4'>
            The following contracts are not deployed on the current network:
          </p>
          <ul className='space-y-2 text-left mb-4'>
            {!matchMakingContract && (
              <li className='flex items-center gap-2 text-red-400'>
                <AlertTriangle className='w-4 h-4' />
                MatchMaking Contract
              </li>
            )}
            {!soulboundNftContract && (
              <li className='flex items-center gap-2 text-red-400'>
                <AlertTriangle className='w-4 h-4' />
                SoulboundNFT Contract
              </li>
            )}
          </ul>
          <p className='text-sm text-gray-500'>
            Make sure you're on the correct network and the contracts are
            deployed.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 100,
          }}
          className='bg-gray-800 rounded-lg p-8 max-w-md w-full text-center'
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 200,
            }}
            className='w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4'
          >
            <Shield className='w-8 h-8 text-red-500' />
          </motion.div>
          <h2 className='text-2xl font-bold text-white mb-2'>Access Denied</h2>
          <p className='text-gray-400 mb-4'>
            Only the contract owner can access this admin panel.
          </p>
          <div className='bg-gray-700/50 p-4 rounded-lg flex items-center gap-3'>
            <AlertTriangle className='w-5 h-5 text-yellow-500 flex-shrink-0' />
            <p className='text-sm text-gray-300 text-left'>
              Your address: {address || 'Not connected'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 p-8 relative z-10'>
      <Modal open={isModalOpen} setOpen={setIsModalOpen}>
        <ModalBody className='w-full max-w-md'>
          <ModalContent>
            <h2 className='text-xl font-bold mb-4'>
              {activeField === ActiveFields.TRANSFER
                ? 'Transfer Funds to Owner'
                : `Update ${
                    activeField === 'amount' ? 'Like Amount' : 'Expiration Days'
                  }`}
            </h2>
            <div className='space-y-4'>
              <input
                type='number'
                step={
                  activeField === ActiveFields.TRANSFER
                    ? '0.001'
                    : activeField === 'amount'
                    ? '0.001'
                    : '1'
                }
                value={newValues[activeField || ActiveFields.AMOUNT]}
                onChange={(e) =>
                  setNewValues((prev) => ({
                    ...prev,
                    [activeField!]: e.target.value,
                  }))
                }
                className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
                placeholder={
                  activeField === ActiveFields.TRANSFER
                    ? 'Enter amount to transfer in ETH'
                    : activeField === 'amount'
                    ? 'Enter amount in ETH'
                    : 'Enter number of days'
                }
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              onClick={
                activeField === ActiveFields.TRANSFER
                  ? () => handleTransferToOwner(newValues.transfer)
                  : handleSave
              }
              isLoading={isUpdating}
              label={activeField === 'transfer' ? 'Transfer' : 'Save Changes'}
              loadingLabel={
                activeField === 'transfer' ? 'Transferring...' : 'Saving...'
              }
              disabled={!isOwner || isUpdating}
              className='w-full'
            />
          </ModalFooter>
        </ModalBody>
      </Modal>

      <motion.div
        variants={containerVariants}
        initial='visible'
        animate='visible'
        className='max-w-4xl mx-auto space-y-8'
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='bg-gray-800 rounded-lg p-6'
        >
          <motion.div
            variants={itemVariants}
            className='bg-gray-800 rounded-lg p-6'
          >
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold text-white'>
                Contract Admin Panel
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm flex items-center gap-2'
              >
                <div className='w-2 h-2 bg-green-400 rounded-full' />
                Owner Access
              </motion.div>
            </div>

            <div className='space-y-8'>
              {/* MatchMaking Contract Section */}
              <div className='bg-gray-800 rounded-lg p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <HeartHandshake className='w-6 h-6 text-primary-500' />
                  <h2 className='text-2xl font-bold text-white'>
                    MatchMaking Contract
                  </h2>
                </div>
                <div className='space-y-4'>
                  <motion.div
                    variants={itemVariants}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Contract Owner</h3>
                      <div className='flex items-center gap-2'>
                        <Lock className='w-4 h-4 text-gray-500' />
                        <span className='font-mono text-sm text-gray-300'>
                          {state.owner}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Contract Balance</h3>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm text-gray-300'>
                          {state.balanceMatchMaking} ETH
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Max Amount Withdrawable</h3>
                      <div className='flex items-center gap-4'>
                        <Button
                          onClick={() => handleOpenModal(ActiveFields.TRANSFER)}
                          label='Transfer to Owner'
                          className='px-4 py-2 bg-primary-500 hover:enabled:bg-primary-600 !w-fit'
                          disabled={
                            !isOwner || !+state.matchMakingMaxAmountCanWithdraw
                          }
                        />
                        <p className='font-mono text-sm text-right text-gray-300'>
                          {`${state.matchMakingMaxAmountCanWithdraw} ETH`}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Like Amount</h3>
                      <div className='flex items-center gap-2'>
                        <span className='text-white'>{state.amount} ETH</span>
                        {isOwner && (
                          <button
                            onClick={() => handleOpenModal(ActiveFields.AMOUNT)}
                            className='p-2 hover:bg-gray-600 rounded-full'
                          >
                            <Edit2 className='w-4 h-4 text-gray-400' />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Like Expiration</h3>
                      <div className='flex items-center gap-2'>
                        <span className='text-white'>
                          {state.expirationDays} days
                        </span>
                        {isOwner && (
                          <button
                            onClick={() =>
                              handleOpenModal(ActiveFields.EXPIRATION_DAYS)
                            }
                            className='p-2 hover:bg-gray-600 rounded-full'
                          >
                            <Edit2 className='w-4 h-4 text-gray-400' />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Match Commission</h3>
                      <div className='flex items-center gap-2'>
                        <span className='text-white'>{state.commission}%</span>
                        {isOwner && (
                          <button
                            onClick={() =>
                              handleOpenModal(ActiveFields.COMMISSION)
                            }
                            className='p-2 hover:bg-gray-600 rounded-full'
                          >
                            <Edit2 className='w-4 h-4 text-gray-400' />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* SoulboundNFT Contract Section */}
              <div className='bg-gray-800 rounded-lg p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Image className='w-6 h-6 text-primary-500' />
                  <h2 className='text-2xl font-bold text-white'>
                    SoulboundNFT Contract
                  </h2>
                </div>
                <div className='space-y-4'>
                  <motion.div
                    variants={itemVariants}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Contract Owner</h3>
                      <div className='flex items-center gap-2'>
                        <Lock className='w-4 h-4 text-gray-500' />
                        <span className='font-mono text-sm text-gray-300'>
                          {state.nftOwner}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Contract Balance</h3>
                      <div className='flex items-center gap-2'>
                        <Lock className='w-4 h-4 text-gray-500' />
                        <span className='font-mono text-sm text-gray-300'>
                          {state.balanceSoulboundNft}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className='bg-gray-700/50 p-4 rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-gray-400'>Mint Fee</h3>
                      <div className='flex items-center gap-2'>
                        <span className='text-white'>{state.mintFee} ETH</span>
                        {isOwner && (
                          <button
                            onClick={() =>
                              handleOpenModal(ActiveFields.MINT_FEE)
                            }
                            className='p-2 hover:bg-gray-600 rounded-full'
                          >
                            <Edit2 className='w-4 h-4 text-gray-400' />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
