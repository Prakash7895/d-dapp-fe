'use client';

import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function detectConnection() {
  // TODO: need to handle this case
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    console.log('Please install MetaMask to use this dApp!');
    throw new Error('MetaMask not installed');
  } else {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      return {
        accounts,
      };
    } catch (err) {
      console.error('User rejected the request', err);
      throw err;
    }
  }
}

export async function connectWallet() {
  if (window.ethereum == null || typeof window.ethereum == 'undefined') {
    console.log('Please install MetaMask to use this dApp!');
    throw new Error('MetaMask not installed');
  } else {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      // provider = new ethers.BrowserProvider(window.ethereum);
      console.log('accounts', accounts);

      // signer = await (provider as ethers.BrowserProvider).getSigner();
      // console.log(signer);
      // console.log(provider);

      return {
        accounts,
      };
    } catch (err) {
      console.error('User rejected the request', err);
      throw err;
    }
  }
}
