
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Attach the correct token based on the requested API route
api.interceptors.request.use(
  (config) => {
    const url = config.url || ''

    const isAdminRoute =
      url.includes('/admin/') ||
      url.startsWith('/settings')

    const token = isAdminRoute
      ? localStorage.getItem('sidhohum_admin_token')
      : localStorage.getItem('sidhohum_auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.'

    error.message = message
    return Promise.reject(error)
  }
)

export default api
