'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchNotifications } from '@/store/thunk';
import { PAGE_SIZE } from '@/store/ChatReducer';
import NotificationItem from '@/components/NotificationItem';
import InfiniteScroll from '@/components/InfiniteScroll';
import Button from '@/components/Button';

const NotificationPage = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const dispatch = useAppDispatch();
  const { notifications, hasMore, loading, pageNo } =
    useAppSelector('notification');

  useEffect(() => {
    dispatch(fetchNotifications({ pageNo: 1, pageSize: PAGE_SIZE }));
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchNotifications({ pageNo, pageSize: PAGE_SIZE }));
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex items-center justify-between mb-6'
      >
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
          Notifications
        </h1>
      </motion.div>

      <div className='flex space-x-4 mb-6'>
        {['all', 'unread', 'read'].map((tab) => (
          <Button
            key={tab}
            onClick={() => setFilter(tab as 'all' | 'unread' | 'read')}
            buttonType='secondary'
            className={`px-4 py-2 rounded-full font-medium transition-all shadow-md !w-fit outline-none ${
              filter === tab
                ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
          />
        ))}
      </div>

      <div className='space-y-4'>
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            <InfiniteScroll
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoading={loading}
              direction='top-to-bottom'
            >
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} {...notification} />
              ))}
            </InfiniteScroll>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='text-center text-gray-500 dark:text-gray-400'
            >
              No notifications to show.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationPage;
