import { createSlice } from '@reduxjs/toolkit'

/** Mock auth slice. Real tokens + backend land in Phase C. Persisted to localStorage (Task 18). */
const initialState = { user: null, status: 'idle' } // status: 'idle' | 'authenticated'

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => { state.user = action.payload; state.status = 'authenticated' },
    logout: (state) => { state.user = null; state.status = 'idle' },
  },
})

export const { loginSuccess, logout } = authSlice.actions

export default authSlice.reducer
