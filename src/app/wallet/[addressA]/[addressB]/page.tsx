'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther } from 'ethers';
import { Wallet, CheckCircle2, XCircle, Clock, Copy } from 'lucide-react';
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
import Loader from '@/components/Loader';
import {
  approveMultiSigProposal,
  inactivateMultiSigProposal,
  submitMultiSigProposal,
} from '@/contract';
import TransactionWrapper from '@/components/TransactionWrapper';

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

  const fetchWalletInfo = async () => {
    if (!walletContract) return;

    try {
      const [_owners, requiredApprovals, balance] = await Promise.all([
        walletContract.getOwners(),
        walletContract.getRequiredApprovals(),
        provider?.getBalance(walletAddress),
      ]);
      const owners = Array.from(_owners) as string[];

      const proposalCount = await walletContract.getProposalCount();

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

      setWalletInfo({
        address: walletAddress,
        owners,
        requiredApprovals: Number(requiredApprovals),
        balance: formatEther(balance!),
        proposals,
      });
    } catch (error) {
      console.log('Error fetching wallet info:', error);
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
      await submitMultiSigProposal(walletContract, destination, amount);
      toast.success('Proposal submitted successfully');
      await fetchWalletInfo();
      setAmount('');
      setDestination('');
    } catch (error) {
      console.log('Error submitting proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveProposal = async (index: number) => {
    if (!walletContract) return;

    try {
      await approveMultiSigProposal(walletContract, index);
      toast.success('Proposal approved successfully');
      await fetchWalletInfo();
    } catch (error) {
      console.log('Error approving proposal:', error);
    }
  };

  const inactivateProposal = async (index: number) => {
    if (!walletContract) return;

    try {
      await inactivateMultiSigProposal(walletContract, index);
      toast.success('Proposal inactivated successfully');
      await fetchWalletInfo();
    } catch (error) {
      console.log('Error inactivating proposal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='bg-gray-900 h-full flex items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='bg-gray-900 p-8 h-full'>
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
              <small className='flex items-center gap-1'>
                {walletInfo?.address}{' '}
                <AnimatedTooltip tooltipContent='Copy Wallet Address'>
                  <Copy
                    size={12}
                    className='text-gray-400 cursor-pointer'
                    onClick={() => {
                      navigator.clipboard.writeText(walletInfo!.address ?? '');
                      toast.success('Wallet address copied to clipboard');
                    }}
                  />
                </AnimatedTooltip>
              </small>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            <div className='bg-gray-700/50 p-4 rounded-lg'>
              <h3 className='text-sm text-gray-400 mb-1'>Balance</h3>
              {Number(walletInfo?.balance) <= 0 ? (
                <p className='text-sm text-yellow-500'>
                  This wallet currently has a balance of 0 ETH. Please deposit
                  funds to initiate transactions or submit proposals.
                </p>
              ) : (
                <p className='text-xl font-semibold text-white'>
                  {walletInfo?.balance} ETH
                </p>
              )}
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
              <h3 className='text-lg font-semibold text-white '>
                Submit New Proposal
              </h3>
              <p className='text-sm text-gray-400 mb-4'>
                To initiate a transaction, submit a proposal by specifying the
                destination address and the amount. Once both wallet owners
                approve the proposal, the funds will be securely transferred to
                the specified destination address.
              </p>
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
              <TransactionWrapper
                disabled={
                  isSubmitting ||
                  !amount ||
                  !destination ||
                  Number(amount) > Number(walletInfo?.balance)
                }
                tooltipContent={{
                  default:
                    Number(amount) > Number(walletInfo?.balance)
                      ? "Entered amount is greater than wallet's balance"
                      : 'Initiate a transaction by submitting a proposal',
                }}
                content={(disabled) => (
                  <Button
                    onClick={submitProposal}
                    disabled={
                      isSubmitting ||
                      !amount ||
                      !destination ||
                      disabled ||
                      Number(amount) > Number(walletInfo?.balance)
                    }
                    className='mt-4 w-full'
                    label='Submit Proposal'
                    loadingLabel='Submitting...'
                    isLoading={isSubmitting}
                  />
                )}
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
                        {proposal.status === ProposalStatus.ACTIVE ? (
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
                          )
                        ) : (
                          <div className='bg-primary-500 text-white px-3 py-1 rounded-full text-xs flex items-center'>
                            Inactive
                          </div>
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
