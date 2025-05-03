'use client';
import { useAppSelector } from '@/store';

const UserProfilePage = () => {
  const {
    user: { data: userData },
  } = useAppSelector('user');

  if (!userData) {
    return <></>;
  }

  return (
    <div className='mx-3'>
      <p className='text-gray-300 mt-2'>
        {userData.profile.bio ||
          'This user has not provided any information about themselves.'}
      </p>

      {userData.profile.interests?.length && (
        <div className='mt-6'>
          <h2 className='text-lg font-semibold text-white'>Interests</h2>
          <div className='flex flex-wrap gap-2 mt-2'>
            {userData.profile.interests.map((interest, index) => (
              <span
                key={index}
                className='bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm'
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
