import { MatchedUserResponse } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MatchState {
  matchedWith: MatchedUserResponse | null;
}

const initialState: MatchState = {
  matchedWith: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setMatchedWith: (state, action: PayloadAction<MatchedUserResponse>) => {
      state.matchedWith = action.payload;
    },
    resetMatch: () => initialState,
  },
});

export const { resetMatch, setMatchedWith } = matchSlice.actions;
export default matchSlice.reducer;
