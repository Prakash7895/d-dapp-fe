import { Notification } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle, Trash2 } from 'lucide-react';
import { FC } from 'react';
import { useStateContext } from './StateProvider';
import { deleteNotification, markNotificationRead } from '@/apiCalls';
import { useAppDispatch } from '@/store';
import {
  markRead,
  deleteNotification as deleteNotifInState,
} from '@/store/NotificationReducer';
import { toast } from 'react-toastify';
import Button from './Button';
import AnimatedTooltip from './AnimatedTooltip';

const NotificationItem: FC<Notification> = (notification) => {
  const { setUserInfo } = useStateContext();
  const dispatch = useAppDispatch();

  const markAsRead = () => {
    markNotificationRead(notification.id).then((res) => {
      if (res.status === 'success') {
        toast.success(res.message);
        setUserInfo((prev) => ({
          ...prev!,
          unreadNotifications: (prev!.unreadNotifications || 1) - 1,
        }));
        dispatch(markRead({ notificationId: notification.id }));
      } else {
        toast.error(res.message);
      }
    });
  };

  const deleteNotif = () => {
    deleteNotification(notification.id).then((res) => {
      if (res.status === 'success') {
        toast.success(res.message);
        if (!notification.read) {
          setUserInfo((prev) => ({
            ...prev!,
            unreadNotifications: (prev!.unreadNotifications || 1) - 1,
          }));
        }
        dispatch(deleteNotifInState({ notificationId: notification.id }));
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-4 my-4 group rounded-lg shadow-md flex items-start justify-between ${
        notification.read
          ? 'bg-gray-100 dark:bg-gray-800'
          : 'bg-blue-50 dark:bg-blue-900'
      }`}
    >
      <div>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
          {notification.title}
        </h3>
        <p
          className='text-sm text-gray-600 dark:text-gray-400'
          dangerouslySetInnerHTML={{ __html: notification.content }}
        />
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {formatDistanceToNow(notification.createdAt)}
        </span>
      </div>
      <div className='items-center space-x-3 hidden group-hover:!flex'>
        {!notification.read && (
          <AnimatedTooltip tooltipContent='Mark as Read'>
            <Button
              onClick={() => markAsRead()}
              className='!p-1 !w-fit rounded-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out'
            >
              <CheckCircle />
            </Button>
          </AnimatedTooltip>
        )}
        <AnimatedTooltip tooltipContent='Delete'>
          <Button
            onClick={() => deleteNotif()}
            className='!p-1 !w-fit rounded-full bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out'
          >
            <Trash2 />
          </Button>
        </AnimatedTooltip>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
