/**
 * 用戶相關 API
 * 示例：如何組織具體的 API 服務模塊
 */
import { get, post, put, del } from './request'

/**
 * 獲取用戶列表
 * @param {object} params - 查詢參數
 * @returns {Promise}
 */
export function getUserList(params = {}) {
  return get('users', params)
}

/**
 * 獲取用戶詳情
 * @param {string|number} id - 用戶 ID
 * @returns {Promise}
 */
export function getUserById(id) {
  return get(`users/${id}`)
}

/**
 * 創建用戶
 * @param {object} data - 用戶數據
 * @returns {Promise}
 */
export function createUser(data) {
  return post('users', data)
}

/**
 * 更新用戶
 * @param {string|number} id - 用戶 ID
 * @param {object} data - 更新的數據
 * @returns {Promise}
 */
export function updateUser(id, data) {
  return put(`users/${id}`, data)
}

/**
 * 刪除用戶
 * @param {string|number} id - 用戶 ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return del(`users/${id}`)
}

/**
 * 透過姓名或email找用戶
 * @param {object} params - 用戶 ID
 * @returns {Promise}
 */
export function findByUserIdOrName(params) {
  return get('users/search', params)
}