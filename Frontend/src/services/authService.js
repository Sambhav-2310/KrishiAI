import api from './api'

export const login = async data => {
  const response = await api.post('/auth/login', data)

  const backendData = response.data

  const user = {
    id: backendData.userId,
    name: backendData.name,
    email: backendData.email,
    role: backendData.role
  }

  if (backendData.token) {
    localStorage.setItem('krishi-token', backendData.token)
  }

  return {
    user,
    token: backendData.token
  }
}

export const register = async data => {
  const response = await api.post('/auth/register', data)
  return response.data
}

export const verifyOtp = async data => {
  const response = await api.post('/auth/verify-otp', data)
  return response.data
}

// =========================
// RESEND OTP
// =========================

export const resendOtp = async email => {
  const response = await api.post('/auth/resend-otp', {
    email
  })

  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}

export const updateProfile = async data => {
  const response = await api.put('/auth/profile', data)
  return response.data
}