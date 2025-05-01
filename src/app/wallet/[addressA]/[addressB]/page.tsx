'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther, parseEther } from 'ethers';
import { Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { WalletInfo, ProposalStatus } from '@/types/wallet';
import Button from '@/components/Button';
import { toast } from 'react-toastify';
import {
  useEthereum,
  useMultiSigWalletContract,
} from '@/components/EthereumProvider';
import { getMultiSigWalletAddress } from '@/apiCalls';
import { UserResponse } from '@/types/user';
import { useStateContext } from '@/components/StateProvider';
import AnimatedTooltip from '@/components/AnimatedTooltip';

export default function WalletPage({
  params,
}: {
  params: Promise<{ addressA: string; addressB: string }>;
}) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { provider } = useEthereum();
  const [ownerUsers, setOwnerUsers] = useState<UserResponse[]>([]);
  const { userInfo } = useStateContext();

  const walletContract = useMultiSigWalletContract(walletAddress);

  console.log('walletAddress', walletAddress);
  console.log('walletContract', walletContract);

  const fetchWalletInfo = async () => {
    if (!walletContract) return;
    console.log('HELLLOOOOOO', walletAddress);

    try {
      const [_owners, requiredApprovals, balance] = await Promise.all([
        walletContract.getOwners(),
        walletContract.getRequiredApprovals(),
        provider?.getBalance(walletAddress),
      ]);
      const owners = Array.from(_owners) as string[];
      console.log('owners', owners);
      console.log('requiredApprovals', requiredApprovals);
      console.log('balance', balance);

      const proposalCount = await walletContract.getProposalCount();
      console.log('proposalCount', proposalCount);

      const proposals = [];
      for (let i = 0; i < Number(proposalCount); i++) {
        const [destination, amount, approvals, executed, status] =
          await walletContract.getProposal(i);

        const approved: { [key: string]: boolean } = {};

        approved[owners[0].toLowerCase()] = await walletContract.isApproved(
          i,
          owners[0]
        );

        approved[owners[1].toLowerCase()] = await walletContract.isApproved(
          i,
          owners[1]
        );

        proposals.push({
          destination,
          amount: formatEther(amount),
          approvals: Number(approvals),
          approved,
          executed,
          status: Number(status),
        });
      }
      console.log('proposals', proposals);

      setWalletInfo({
        address: walletAddress,
        owners,
        requiredApprovals: Number(requiredApprovals),
        balance: formatEther(balance!),
        proposals,
      });
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      toast.error('Failed to fetch wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletAddress = async () => {
    const addresses = await params;
    getMultiSigWalletAddress(addresses.addressA, addresses.addressB).then(
      (res) => {
        if (res.status === 'success') {
          setWalletAddress(res.data?.walletAddress || '');
          if (res.data) {
            setOwnerUsers([res.data?.userA, res.data?.userB]);
          }
        } else {
          toast.error(res.message);
        }
      }
    );
  };

  useEffect(() => {
    getWalletAddress();
  }, []);

  useEffect(() => {
    if (walletAddress && walletContract) {
      fetchWalletInfo();
    }
  }, [walletAddress, walletContract]);

  const submitProposal = async () => {
    if (!walletContract || !amount || !destination) return;

    setIsSubmitting(true);
    try {
      const tx = await walletContract.submitProposal(
        destination,
        parseEther(amount)
      );
      await tx.wait();
      toast.success('Proposal submitted successfully');
      await fetchWalletInfo();
      setAmount('');
      setDestination('');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error('Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveProposal = async (index: number) => {
    if (!walletContract) return;

    try {
      const tx = await walletContract.approveProposal(index);
      await tx.wait();
      toast.success('Proposal approved successfully');
      await fetchWalletInfo();
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast.error('Failed to approve proposal');
    }
  };

  const inactivateProposal = async (index: number) => {
    if (!walletContract) return;

    try {
      const tx = await walletContract.inactivateProposal(index);
      await tx.wait();
      toast.success('Proposal inactivated successfully');
      await fetchWalletInfo();
    } catch (error) {
      console.error('Error inactivating proposal:', error);
      toast.error('Failed to inactivate proposal');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <motion.div
          className='w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full'
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        className='max-w-4xl mx-auto space-y-8'
      >
        <div className='bg-gray-800 rounded-lg p-6'>
          <div className='flex items-start gap-3 mb-6'>
            <Wallet className='w-6 h-6 text-primary-500 mt-1.5' />
            <div className='flex flex-col'>
              <h1 className='text-2xl font-bold text-white'>
                Multi-Signature Wallet
              </h1>
              <small>{walletInfo?.address}</small>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h3 className='text-sm text-gray-400 mb-1'>Balance</h3>
              <p className='text-xl font-semibold text-white'>
                {walletInfo?.balance} ETH
              </p>
            </div>
            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h3 className='text-sm text-gray-400 mb-1'>Required Approvals</h3>
              <p className='text-xl font-semibold text-white'>
                {walletInfo?.requiredApprovals}
              </p>
            </div>
            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h3 className='text-sm text-gray-400 mb-3'>Wallet Owners</h3>
              <div className='space-y-3'>
                {ownerUsers.map((owner) => {
                  return (
                    <div
                      key={owner.id}
                      className='flex items-center justify-between gap-3 p-2 bg-gray-800/50 rounded-lg overflow-x-auto'
                    >
                      <div className='w-10 h-10 rounded-full shrink-0 bg-primary-500/10 flex items-center justify-center'>
                        {owner.profile?.profilePicture ? (
                          <img
                            src={owner.profile?.profilePicture}
                            alt={owner.profile?.firstName || ''}
                            className='w-10 h-10 rounded-full object-cover'
                          />
                        ) : (
                          <span className='text-primary-500 text-sm font-medium'>
                            {owner.profile?.firstName?.[0]}
                            {owner.profile?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-white font-medium truncate'>
                          {owner.profile
                            ? `${owner.profile.firstName} ${owner.profile.lastName}`
                            : 'Unknown User'}
                        </h4>
                        <p className='text-xs text-gray-400 font-mono'>
                          {owner.walletAddress?.slice(0, 6)}...
                          {owner.walletAddress?.slice(-4)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Submit New Proposal
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input
                  type='text'
                  placeholder='Destination Address'
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className='bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white w-full'
                />
                <input
                  type='number'
                  step='0.001'
                  placeholder='Amount (ETH)'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className='bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white w-full'
                />
              </div>
              <Button
                onClick={submitProposal}
                disabled={isSubmitting || !amount || !destination}
                className='mt-4 w-full'
                label='Submit Proposal'
                loadingLabel='Submitting...'
                isLoading={isSubmitting}
              />
            </div>

            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Proposals
              </h3>
              <div className='space-y-4'>
                {walletInfo?.proposals.map((proposal, index) => (
                  <div key={index} className='bg-gray-800 p-4 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        {proposal.executed ? (
                          <CheckCircle2 className='w-4 h-4 text-green-500' />
                        ) : proposal.status === ProposalStatus.ACTIVE ? (
                          <Clock className='w-4 h-4 text-yellow-500' />
                        ) : (
                          <XCircle className='w-4 h-4 text-red-500' />
                        )}
                        <span className='text-white'>
                          Proposal #{index + 1}
                        </span>
                      </div>
                      <span className='text-primary-400'>
                        {proposal.amount} ETH
                      </span>
                    </div>
                    <p className='text-sm text-gray-400 mb-2'>
                      To: {proposal.destination}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-400'>
                          Approvals: {proposal.approvals}/
                          {walletInfo.requiredApprovals}
                        </span>
                        <div className='flex gap-2 ml-2'>
                          {walletInfo.owners.map((owner) => (
                            <AnimatedTooltip
                              key={owner}
                              tooltipContent={`${owner.slice(
                                0,
                                6
                              )}...${owner.slice(-4)} ${
                                proposal.approved[owner.toLowerCase()]
                                  ? 'Approved'
                                  : 'Not Approved'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  proposal.approved[owner.toLowerCase()]
                                    ? 'bg-green-500'
                                    : 'bg-gray-600'
                                }`}
                                title={`${owner.slice(0, 6)}...${owner.slice(
                                  -4
                                )} ${
                                  proposal.approved[owner.toLowerCase()]
                                    ? 'Approved'
                                    : 'Not Approved'
                                }`}
                              />
                            </AnimatedTooltip>
                          ))}
                        </div>
                      </div>
                      <div className='flex gap-2 items-center'>
                        {proposal.status === ProposalStatus.ACTIVE &&
                          !proposal.executed && (
                            <>
                              {userInfo?.walletAddress &&
                                !proposal.approved[
                                  userInfo.walletAddress?.toLowerCase()
                                ] && (
                                  <Button
                                    onClick={() => approveProposal(index)}
                                    label='Approve'
                                    className='px-4 py-2'
                                  />
                                )}
                              <Button
                                onClick={() => inactivateProposal(index)}
                                label='Cancel'
                                className='px-4 py-2 !bg-red-500 hover:!bg-red-600'
                              />
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
