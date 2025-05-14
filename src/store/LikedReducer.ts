import { LikdedUser } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchLikedUsers } from './thunk';

interface LikedState {
  data: LikdedUser[];
  pageNo: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

const initialState: LikedState = {
  hasMore: true,
  loading: false,
  data: [],
  pageNo: 1,
  total: 0,
};

const likedUsersSlice = createSlice({
  name: 'likedUsers',
  initialState,
  reducers: {
    removeUser: (state, action: PayloadAction<{ userId: string }>) => {
      const updatedUsers = state.data.filter(
        (user) => user.id !== action.payload.userId
      );
      state.data = updatedUsers;
    },
    resetLikedUsers: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(fetchLikedUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLikedUsers.fulfilled, (state, action) => {
        state.loading = false;
        const existingData = state.data.map((dt) => ({ ...dt }));

        const newData = action.payload.data?.users?.filter(
          (n) => !existingData.some((dt) => dt.id === n.id)
        );

        state.data = [...existingData, ...(newData || [])];
        state.hasMore =
          (action.payload.data?.users!.length ?? 0) >= action.payload.pageSize;
        state.pageNo = action.payload.page;
        state.total = action.payload.data?.total ?? 0;
      })
      .addCase(fetchLikedUsers.rejected, (state) => {
        state.loading = false;
        state.hasMore = false;
        console.log('Failed to fetch liked users');
      });
  },
});

export const { removeUser, resetLikedUsers } = likedUsersSlice.actions;
export default likedUsersSlice.reducer;
