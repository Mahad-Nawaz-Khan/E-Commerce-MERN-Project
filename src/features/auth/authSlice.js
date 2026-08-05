import { createSlice } from '@reduxjs/toolkit'

const initialState = { 
  user: null, 
  token: null,
  status: 'idle' // 'idle' | 'loading' | 'authenticated'
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.status = 'authenticated'
    },
    loginSuccess: (state, action) => { 
      state.user = action.payload.user
      state.token = action.payload.token
      state.status = 'authenticated' 
    },
    tokenRefreshed: (state, action) => {
      state.token = action.payload.token
    },
    logout: (state) => { 
      state.user = null
      state.token = null
      state.status = 'idle' 
    },
    setLoading: (state) => {
      state.status = 'loading'
    },
  },
})

export const { setCredentials, loginSuccess, tokenRefreshed, logout, setLoading } = authSlice.actions

export const authReducer = authSlice.reducer

export default authSlice.reducer
