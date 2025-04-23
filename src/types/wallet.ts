import { UserResponse } from './user';

export enum ProposalStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

export interface Proposal {
  destination: string;
  amount: string;
  approvals: number;
  approved: { [key: string]: boolean };
  executed: boolean;
  status: ProposalStatus;
}

export interface WalletInfo {
  address: string;
  owners: string[];
  requiredApprovals: number;
  balance: string;
  proposals: Proposal[];
}

export interface MultiSigWallet {
  id: string;
  addressA: string;
  addressB: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
  userA: UserResponse;
  userB: UserResponse;
}
