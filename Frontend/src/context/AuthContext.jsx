import { createContext, useCallback, useState } from 'react'
import * as auth from '../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
      JSON.parse(
          localStorage.getItem('krishi-user') || 'null'
      )
  )

  const commit = useCallback(u => {
    setUser(u)

    if (u) {
      localStorage.setItem(
          'krishi-user',
          JSON.stringify(u)
      )
    } else {
      localStorage.removeItem('krishi-user')
    }
  }, [])

  // =========================
  // LOGIN
  // =========================

  const login = useCallback(async data => {
    const response = await auth.login(data)

    commit(response.user)

    return response.user
  }, [commit])


  // =========================
  // REGISTER
  // =========================

  const register = useCallback(async data => {
    const response = await auth.register(data)

    return response
  }, [])


  // =========================
  // VERIFY OTP
  // =========================

  const verifyOtp = useCallback(async data => {
    const response = await auth.verifyOtp(data)

    return response
  }, [])


  // =========================
  // RESEND OTP
  // =========================

  const resendOtp = useCallback(async email => {
    const response = await auth.resendOtp(email)

    return response
  }, [])


  // =========================
  // GET PROFILE
  // =========================

  const getProfile = useCallback(async () => {
    const response = await auth.getProfile()

    /*
     * IMPORTANT:
     *
     * Do NOT call commit(response) here.
     *
     * Profile.jsx uses this response to populate
     * the profile form.
     *
     * Calling commit() here changes `user`, which
     * causes the Profile useEffect to run again.
     */

    return response
  }, [])


  // =========================
  // UPDATE PROFILE
  // =========================

  const updateProfile = useCallback(async data => {
    const response = await auth.updateProfile(data)

    /*
     * Updating the profile SHOULD update the
     * authenticated user stored in context.
     */

    commit(response)

    return response
  }, [commit])


  // =========================
  // LOGOUT
  // =========================

  const logout = useCallback(() => {
    setUser(null)

    localStorage.removeItem('krishi-user')
    localStorage.removeItem('krishi-token')
  }, [])


  return (
      <AuthContext.Provider
          value={{
            user,
            login,
            register,
            verifyOtp,
            resendOtp,
            getProfile,
            updateProfile,
            logout
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}