import axios from 'axios'

const api = axios.create({
  baseURL: 'https://django-back-end-pfnc.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})


export default api
