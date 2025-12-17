import request from './request'
const { get, post, put, delete: del } = request

/**
 * 優惠券 API
 */

// 查詢所有優惠券
export function getAllCoupons() {
  return get('/api/coupons')
}

// 根據 ID 查詢優惠券
export function getCouponById(id) {
  return get(`/api/coupons/${id}`)
}

// 根據序號查詢優惠券
export function getCouponBySn(sn) {
  return get(`/api/coupons/sn/${sn}`)
}

// 新增優惠券
export function createCoupon(data) {
  return post('/api/coupons', data)
}

// 更新優惠券
export function updateCoupon(id, data) {
  return put(`/api/coupons/${id}`, data)
}

// 刪除優惠券
export function deleteCoupon(id) {
  return del(`/api/coupons/${id}`)
}

// 檢查序號是否存在
export function checkSnExists(sn) {
  return get('/api/coupons/check-sn', { sn })
}

