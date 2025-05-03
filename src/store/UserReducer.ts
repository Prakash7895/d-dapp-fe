import { IUserData, IUserFiles, IUserNfts } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserFiles, fetchUserNfts } from './thunk';

interface UserState {
  user: { data: IUserData | null; loading: boolean };
  files: {
    data: IUserFiles[];
    loading: boolean;
    hasMore: boolean;
    pageNo: number;
  };
  nfts: {
    data: IUserNfts[];
    loading: boolean;
    hasMore: boolean;
    pageNo: number;
  };
}

const initialState: UserState = {
  user: {
    data: null,
    loading: false,
  },
  files: {
    data: [],
    loading: false,
    hasMore: true,
    pageNo: 1,
  },
  nfts: {
    data: [],
    loading: false,
    hasMore: true,
    pageNo: 1,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.user.loading = action.payload;
    },
    setUserData: (state, action: PayloadAction<IUserData>) => {
      state.user.data = action.payload;
    },
    resetMatch: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUserFiles.pending, (state) => {
        state.files.loading = true;
      })
      .addCase(fetchUserFiles.fulfilled, (state, action) => {
        state.files.loading = false;

        const existingFiles = state.files.data.map((dt) => ({ ...dt }));

        const newFiles = action.payload.data?.filter(
          (dt) =>
            !existingFiles.some((existingFile) => existingFile.id === dt.id)
        );
        if (newFiles) {
          if (state.files.pageNo === 1) {
            state.files.data = newFiles;
          } else {
            state.files.data = [...existingFiles, ...newFiles];
          }
        }
        state.files.hasMore =
          action.payload?.data?.length! >= action.payload.pageSize;
        state.files.pageNo = action.payload.page;
      })
      .addCase(fetchUserFiles.rejected, (state) => {
        state.files.loading = false;
        state.files.hasMore = false;
        console.log('Failed to fetch user files');
      })
      .addCase(fetchUserNfts.pending, (state) => {
        state.nfts.loading = true;
      })
      .addCase(fetchUserNfts.fulfilled, (state, action) => {
        state.nfts.loading = false;

        const existingNfts = state.nfts.data.map((dt) => ({ ...dt }));

        const newNfts = action.payload.data?.filter(
          (dt) => !existingNfts.some((existingNft) => existingNft.id === dt.id)
        );
        if (newNfts) {
          if (state.nfts.pageNo === 1) {
            state.nfts.data = newNfts;
          } else {
            state.nfts.data = [...existingNfts, ...newNfts];
          }
        }
        state.nfts.hasMore =
          action.payload?.data?.length! >= action.payload.pageSize;
        state.nfts.pageNo = action.payload.page;
      })
      .addCase(fetchUserNfts.rejected, (state) => {
        state.nfts.loading = false;
        state.nfts.hasMore = false;
        console.log('Failed to fetch user nfts');
      });
  },
});

export const { resetMatch, setUserData, setUserLoading } = userSlice.actions;
export default userSlice.reducer;
