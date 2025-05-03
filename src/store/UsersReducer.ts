import { AllUsers } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUsers } from './thunk';

interface UsersState {
  users: AllUsers[];
  loading: boolean;
  hasMore: boolean;
  pageNo: number;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  hasMore: true,
  pageNo: 1,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsers: () => initialState,
    updateUserProperty: (
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<AllUsers>;
      }>
    ) => {
      const { id, data } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === id);
      if (userIndex !== -1) {
        const updatedUser = {
          ...state.users[userIndex],
          ...data,
        };
        state.users[userIndex] = updatedUser;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const existingUsers = state.users.map((dt) => ({ ...dt }));

        const newUsers = action.payload.data?.users?.filter(
          (dt) =>
            !existingUsers.some((existingUser) => existingUser.id === dt.id)
        );
        state.users = [...existingUsers, ...(newUsers || [])];
        state.hasMore =
          action.payload.data!.users.length! >= action.payload.pageSize;
        state.pageNo = action.payload.page;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false;
        console.log('Failed to fetch users');
      });
  },
});

export const { resetUsers, updateUserProperty } = usersSlice.actions;
export default usersSlice.reducer;
