import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useAuthStore = create(
  devtools(
    set => ({
      username: 'dev',
      loggedIn: true,
      setLoggedIn: loggedIn => set(state => ({ ...state, loggedIn })),
      setUsername: username => set(state => ({ ...state, username })),
      toggleDummyLogin: username =>
        set(state => {
          const newLoggedIn = !state.loggedIn
          return {
            ...state,
            loggedIn: newLoggedIn,
            userId: newLoggedIn ? username : '',
          }
        }), // Dummy method for testing purposes
    }),
    { name: 'auth-store' }
  )
)

export default useAuthStore
