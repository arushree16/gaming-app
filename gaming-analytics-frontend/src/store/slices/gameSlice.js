import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  games: [],
  currentGame: null,
  analytics: null,
  loading: false,
  error: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGames: (state, action) => {
      state.games = action.payload;
    },
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setGames, setCurrentGame, setAnalytics, setLoading, setError } = gameSlice.actions;
export default gameSlice.reducer; 