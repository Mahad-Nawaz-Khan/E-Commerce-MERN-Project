import { createSlice } from '@reduxjs/toolkit'

/** Ephemeral UI state — drawers and mobile menus. Not persisted. */
const initialState = { mobileNavOpen: false, cartDrawerOpen: false, mobileFiltersOpen: false }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav: (state) => { state.mobileNavOpen = !state.mobileNavOpen },
    closeMobileNav: (state) => { state.mobileNavOpen = false },
    openCartDrawer: (state) => { state.cartDrawerOpen = true },
    closeCartDrawer: (state) => { state.cartDrawerOpen = false },
    toggleCartDrawer: (state) => { state.cartDrawerOpen = !state.cartDrawerOpen },
    toggleMobileFilters: (state) => { state.mobileFiltersOpen = !state.mobileFiltersOpen },
    closeMobileFilters: (state) => { state.mobileFiltersOpen = false },
  },
})

export const {
  toggleMobileNav, closeMobileNav, openCartDrawer, closeCartDrawer,
  toggleCartDrawer, toggleMobileFilters, closeMobileFilters,
} = uiSlice.actions

export default uiSlice.reducer
