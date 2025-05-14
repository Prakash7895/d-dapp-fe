import { MatchedUser } from '@/types/user';
import { createSlice } from '@reduxjs/toolkit';
import { fetchMatchedUsers } from './thunk';

interface MatchesState {
  data: MatchedUser[];
  pageNo: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

const initialState: MatchesState = {
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
    resetMatchedUsers: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMatchedUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatchedUsers.fulfilled, (state, action) => {
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
      .addCase(fetchMatchedUsers.rejected, (state) => {
        state.loading = false;
        state.hasMore = false;
        console.log('Failed to fetch matched users');
      });
  },
});

export const { resetMatchedUsers } = likedUsersSlice.actions;
export default likedUsersSlice.reducer;
