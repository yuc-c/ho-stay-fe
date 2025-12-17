import request from './request'
const { get, post, put, delete: del } = request

/**
 * 營運分析 API
 */

// 獲取所有營運分析數據
export function getAllAnalytics() {
  return get('/api/analytics/daily')
}

// 根據 ID 獲取營運分析數據
export function getAnalyticsById(id) {
  return get(`/api/analytics/daily/${id}`)
}

// 根據日期獲取營運分析數據
export function getAnalyticsByDate(date) {
  return get('/api/analytics/daily/date', { date })
}

// 創建營運分析數據
export function createAnalytics(data) {
  return post('/api/analytics/daily', data)
}

// 更新營運分析數據
export function updateAnalytics(id, data) {
  return put(`/api/analytics/daily/${id}`, data)
}

// 刪除營運分析數據
export function deleteAnalytics(id) {
  return del(`/api/analytics/daily/${id}`)
}

// 獲取今日新增用戶數
export function getTodayNewUsers() {
  return get('/api/analytics/daily/new-users/today')
}

// 獲取今日新增評論數
export function getTodayNewReviews() {
  return get('/api/analytics/daily/new-reviews/today')
}

// 獲取今日新增飯店數
export function getTodayNewHotels() {
  return get('/api/analytics/daily/new-hotels/today')
}

// 獲取今日客服案件數
export function getTodaySupportCases() {
  return get('/api/analytics/daily/support-cases/today')
}

// 獲取指定日期的歷史概況數據
// allowFallback: true 用於平台規模成長趨勢（查詢最近的一筆數據），false 用於歷史概況（沒有數據返回0）
export function getHistoricalData(date, allowFallback = false) {
  return get('/api/analytics/daily/historical', { date, allowFallback })
}

// 獲取日期範圍內的訂單與成交額數據
export function getOrderRevenueData(startDate, endDate) {
  return get('/api/analytics/daily/order-revenue', { startDate, endDate })
}

// 獲取指定月份的聚合數據（用於平台規模成長趨勢 - 月趨勢）
// 計算該月份所有資料的總和 / 當月資料筆數，取平均值
// 例如12月有三筆資料，就是12月資料相加後除以3
export function getMonthlyAggregate(year, month) {
  return get('/api/analytics/daily/monthly-aggregate', { year, month })
}

// 獲取指定季度的聚合數據（用於平台規模成長趨勢 - 季趨勢）
// 計算該季度三個月份的數據相加 / 3，取整數
export function getQuarterlyAggregate(year, quarter) {
  return get('/api/analytics/daily/quarterly-aggregate', { year, quarter })
}

