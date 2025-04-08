'use client';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data, status } = useSession();
  console.log('DATA', data);
  console.log('STATUS', status);

  return <div className='h-full flex justify-center items-center'>Hello</div>;
}
