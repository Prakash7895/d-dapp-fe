import { Notification } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchNotifications } from './thunk';
import { PAGE_SIZE } from './ChatReducer';

interface NotificationState {
  notifications: Notification[];
  pageNo: number;
  hasMore: boolean;
  loading: boolean;
}

const initialState: NotificationState = {
  hasMore: true,
  loading: false,
  notifications: [],
  pageNo: 1,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetNotification: () => initialState,
    markRead: (state, action: PayloadAction<{ notificationId: string }>) => {
      const notificationIndex = state.notifications.findIndex(
        (notification) => notification.id === action.payload.notificationId
      );
      if (notificationIndex !== -1) {
        state.notifications[notificationIndex].read = true;
      }
    },
    deleteNotification: (
      state,
      action: PayloadAction<{ notificationId: string }>
    ) => {
      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== action.payload.notificationId
      );

      state.notifications = updatedNotifications;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const existingData = state.notifications.map((dt) => ({ ...dt }));

        const newNotifications = action.payload.data?.filter(
          (n) => !existingData.some((dt) => dt.id === n.id)
        );

        state.notifications = [...existingData, ...(newNotifications || [])];
        state.hasMore = action.payload.data!.length! >= PAGE_SIZE;
        state.pageNo = action.payload.page;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
        console.log('Failed to fetch chats');
      });
  },
});

export const { resetNotification, markRead, deleteNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
