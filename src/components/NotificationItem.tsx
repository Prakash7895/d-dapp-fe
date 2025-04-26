import { Notification } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { FC } from 'react';

const NotificationItem: FC<Notification> = (notification) => {
  const markAsRead = () => {
    // setNotifications((prev) =>
    //   prev.map((notification) =>
    //     notification.id === id ? { ...notification, read: true } : notification
    //   )
    // );
  };

  const deleteNotification = () => {
    // setNotifications((prev) =>
    //   prev.filter((notification) => notification.id !== id)
    // );
  };

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg shadow-md flex items-start justify-between ${
        notification.read
          ? 'bg-gray-100 dark:bg-gray-800'
          : 'bg-blue-50 dark:bg-blue-900'
      }`}
    >
      <div>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
          {notification.title}
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {notification.content}
        </p>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {formatDistanceToNow(notification.createdAt)}
        </span>
      </div>
      <div className='flex items-center space-x-2'>
        {!notification.read && (
          <button
            onClick={() => markAsRead()}
            className='p-2 rounded-full bg-green-500 hover:bg-green-600 text-white'
          >
            <CheckCircle className='h-5 w-5' />
          </button>
        )}
        <button
          onClick={() => deleteNotification()}
          className='p-2 rounded-full bg-red-500 hover:bg-red-600 text-white'
        >
          <XCircle className='h-5 w-5' />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
