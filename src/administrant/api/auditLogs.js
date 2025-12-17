import request from './request'
const { get } = request

/**
 * 審計日誌 API
 */

// 搜索審計日誌（完整記錄列表，支持分頁和篩選）
export function searchAuditLogs(params = {}) {
  const queryParams = {
    page: params.page || 0,
    size: params.size || 20
  }

  // 只添加有值的參數（排除空字串）
  if (params.actionType && params.actionType.trim()) {
    queryParams.actionType = params.actionType.trim()
    console.log('設置 actionType 篩選:', queryParams.actionType)
  } else {
    console.log('actionType 為空，不設置篩選')
  }
  if (params.targetTable && params.targetTable.trim()) {
    queryParams.targetTable = params.targetTable.trim()
  }

  // 處理 actorUserId：轉換為數字，並過濾空值
  if (params.actorUserId !== null && params.actorUserId !== undefined && params.actorUserId !== '') {
    const userIdStr = params.actorUserId.toString().trim()
    if (userIdStr) {
      const userIdNum = Number(userIdStr)
      if (!isNaN(userIdNum) && userIdNum > 0) {
        queryParams.actorUserId = userIdNum
      }
    }
  }

  // 處理日期格式：將 YYYY-MM-DD 轉換為 ISO 8601 格式（YYYY-MM-DDTHH:mm:ss）
  if (params.from && params.from.trim()) {
    // 如果是日期格式（YYYY-MM-DD），轉換為當天的開始時間
    if (params.from.match(/^\d{4}-\d{2}-\d{2}$/)) {
      queryParams.from = `${params.from}T00:00:00`
    } else {
      queryParams.from = params.from
    }
  }
  if (params.to && params.to.trim()) {
    // 如果是日期格式（YYYY-MM-DD），轉換為下一天的開始時間（因為後端使用 lessThan）
    // 這樣可以確保包含當天的所有記錄
    if (params.to.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(params.to)
      date.setDate(date.getDate() + 1) // 加一天
      const nextDay = date.toISOString().split('T')[0] // 獲取 YYYY-MM-DD 格式
      queryParams.to = `${nextDay}T00:00:00`
    } else {
      queryParams.to = params.to
    }
  }

  if (params.targetId !== null && params.targetId !== undefined && params.targetId !== '') {
    const targetIdNum = Number(params.targetId)
    if (!isNaN(targetIdNum) && targetIdNum > 0) {
      queryParams.targetId = targetIdNum
    }
  }
  if (params.keyword && params.keyword.trim()) {
    queryParams.keyword = params.keyword.trim()
  }

  console.log('最終查詢參數:', queryParams)
  return get('/api/audit-logs/list', queryParams)
}

// 搜索審計日誌（欄位級別的變更）
export function searchAuditLogsFieldChanges(params = {}) {
  const queryParams = {
    page: params.page || 0,
    size: params.size || 20
  }

  // 只添加有值的參數
  if (params.actionType) queryParams.actionType = params.actionType
  if (params.targetTable) queryParams.targetTable = params.targetTable
  if (params.actorUserId) queryParams.actorUserId = params.actorUserId
  if (params.from) queryParams.from = params.from
  if (params.to) queryParams.to = params.to
  if (params.targetId) queryParams.targetId = params.targetId
  if (params.keyword) queryParams.keyword = params.keyword

  return get('/api/audit-logs', queryParams)
}

// 根據 ID 獲取完整的審計日誌（JSON 格式）
export function getAuditLogFullById(id) {
  return get(`/api/audit-logs/${id}/full`)
}

// 根據 ID 獲取審計日誌（欄位級別的變更）
export function getAuditLogById(id) {
  return get(`/api/audit-logs/${id}`)
}

