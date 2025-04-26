import { Notification } from '@/types/user';
import { createSlice } from '@reduxjs/toolkit';
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
        state.hasMore = action.payload.data?.length! >= PAGE_SIZE;
        state.pageNo = action.payload.page;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
        console.log('Failed to fetch chats');
      });
  },
});

export const { resetNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
