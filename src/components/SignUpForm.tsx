'use client';
import { connectWallet } from '@/contract';
import { useStateContext } from './StateProvider';
import IPFSUploader from './IPFSUploader';
import UserInfoForm from './UserInfoForm';

const SignUpForm = () => {
  const { connected, setConnected, setUserAddress } = useStateContext();

  const connect = () => {
    connectWallet().then((res) => {
      console.log('RES3', res);
      setUserAddress(res.address);
      if (res.address) {
        setConnected(true);
      }
    });
  };

  return (
    <div>
      <div>
        {!connected ? (
          <button className='p-[3px] relative mx-auto'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg' />
            <div
              onClick={connect}
              className='px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent'
            >
              Sign Up with MetaMask
            </div>
          </button>
        ) : (
          <p className='text-center'>Mint your profile NFT to sign up</p>
        )}
        <div className='border-[1px] rounded-xl border-gray-800 border-dashed mt-5'>
          <IPFSUploader onSuccess={() => {}} />
        </div>
      </div>
      <div>
        <UserInfoForm />
      </div>
    </div>
  );
};

export default SignUpForm;
