import axios from 'axios'

const axiosInstance = axios.create({
    baseURL : `${import.meta.env.VITE_backend_url}`
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      // ✅ initialize headers if they don't exist yet
      if (!config.headers) {
        config.headers = {}
      }
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)
export default axiosInstance