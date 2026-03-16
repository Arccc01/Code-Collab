import axios from 'axios'

const apiurl  = import.meta.env.vite_url
const instance = axios.create({
    baseURL : apiurl
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default instance