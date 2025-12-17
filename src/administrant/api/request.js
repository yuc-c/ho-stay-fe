/**
 * API 請求封裝
 * 基於 Axios 實例封裝常用的請求方法
 */
import axiosInstance from '@/administrant/utils/axios'

/**
 * GET 請求
 * @param {string} url - 請求 URL
 * @param {object} params - 查詢參數
 * @param {object} config - Axios 配置
 * @returns {Promise}
 */
export function get(url, params = {}, config = {}) {
  return axiosInstance.get(url, {
    params,
    ...config,
  })
}

/**
 * POST 請求
 * @param {string} url - 請求 URL
 * @param {any} data - 請求數據
 * @param {object} config - Axios 配置
 * @returns {Promise}
 */
export function post(url, data = {}, config = {}) {
  return axiosInstance.post(url, data, config)
}

/**
 * PUT 請求
 * @param {string} url - 請求 URL
 * @param {any} data - 請求數據
 * @param {object} config - Axios 配置
 * @returns {Promise}
 */
export function put(url, data = {}, config = {}) {
  return axiosInstance.put(url, data, config)
}

/**
 * PATCH 請求
 * @param {string} url - 請求 URL
 * @param {any} data - 請求數據
 * @param {object} config - Axios 配置
 * @returns {Promise}
 */
export function patch(url, data = {}, config = {}) {
  return axiosInstance.patch(url, data, config)
}

/**
 * DELETE 請求
 * @param {string} url - 請求 URL
 * @param {object} config - Axios 配置
 * @returns {Promise}
 */
export function del(url, config = {}) {
  return axiosInstance.delete(url, config)
}

/**
 * 上傳文件
 * @param {string} url - 請求 URL
 * @param {FormData} formData - 表單數據
 * @param {object} config - Axios 配置（可包含 onUploadProgress 等）
 * @returns {Promise}
 */
export function upload(url, formData, config = {}) {
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  })
}

/**
 * 下載文件
 * @param {string} url - 請求 URL
 * @param {object} params - 查詢參數
 * @param {string} filename - 下載的文件名
 * @returns {Promise}
 */
export function download(url, params = {}, filename = '') {
  return axiosInstance.get(url, {
    params,
    responseType: 'blob',
  }).then((response) => {
    // 創建下載鏈接
    const blob = new Blob([response])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || `download-${Date.now()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    return response
  })
}

// 導出 axios 實例，以便需要時直接使用
export { axiosInstance }
export default {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  download,
  axiosInstance,
}

