import request from './request'
const { get, post, put, delete: del } = request

/**
 * 評論違規處理 API
 */

// 獲取所有審核操作（支持分頁）
export function listModerationActions(params = {}) {
  const queryParams = {}
  if (params.page !== undefined) queryParams.page = params.page
  if (params.size !== undefined) queryParams.size = params.size
  
  return get('/api/moderation-actions', queryParams)
}

// 根據 ID 獲取審核操作
export function getModerationActionById(id) {
  return get(`/api/moderation-actions/${id}`)
}

// 創建審核操作
export function createModerationAction(data) {
  return post('/api/moderation-actions', data)
}

// 更新審核操作
export function updateModerationAction(id, data) {
  return put(`/api/moderation-actions/${id}`, data)
}

// 刪除審核操作
export function deleteModerationAction(id) {
  return del(`/api/moderation-actions/${id}`)
}

// 獲取本月總評論數
export function getMonthTotalReviews() {
  return get('/api/moderation-actions/stats/month-total-reviews')
}

