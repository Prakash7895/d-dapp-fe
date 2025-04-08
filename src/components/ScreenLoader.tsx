import React from 'react';
import Loader from './Loader';

const ScreenLoader = () => (
  <div className='flex min-h-screen items-center justify-center'>
    <Loader size={96} />
  </div>
);

export default ScreenLoader;
