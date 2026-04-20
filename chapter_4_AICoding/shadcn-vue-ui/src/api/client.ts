import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器：统一处理响应格式
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 处理标准格式响应 (code, message, data)
    if (res && res.code !== undefined) {
      if (res.code !== 200) {
        return Promise.reject(new Error(res.message || 'Error'))
      }
      return res.data
    }
    
    // 处理认证响应格式 (success, access_token, etc.)
    if (res && res.success !== undefined) {
      return res
    }
    
    // 默认返回响应数据
    return res
  },
  (error) => {
    console.error('API Error:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    return Promise.reject(error)
  }
)

export { apiClient as client }
export default apiClient
