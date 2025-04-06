'use client';
import Loader from './Loader';
import { useStateContext } from './StateProvider';

const ProfileInfo = () => {
  const { activeProfilePhoto } = useStateContext();

  return (
    <div className='relative md:mx-52 mx-16'>
      <div className='border-[1px] border-gray-600 bg-white dark:bg-neutral-900 absolute -top-12 rounded-lg overflow-hidden p-1'>
        {activeProfilePhoto ? (
          <img
            src={activeProfilePhoto}
            alt='User Profile Image'
            className='h-36 w-36 object-cover rounded-md'
          />
        ) : (
          <div className='h-36 w-36 flex items-center justify-center'>
            <Loader />
          </div>
        )}
      </div>
      <div className='pl-44 pb-3'>
        <p className='text-3xl mb-2'>John, Doe</p>
        <p>Male, Tokyo</p>
      </div>
    </div>
  );
};

export default ProfileInfo;
