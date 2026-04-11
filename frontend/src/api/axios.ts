import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true, // send httpOnly JWT cookie automatically
})

// If the server says the session has expired, send the user back to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') {
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
