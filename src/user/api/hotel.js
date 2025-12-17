// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

/**
 * 飯店 API
 */
export const hotelAPI = {
  /**
   * 獲取業者的所有飯店
   * 從 JWT token 中獲取用戶 ID
   * @param {Object} params - 查詢參數 { page: 1, size: 3, cityId: null, districtId: null, businessStatus: null, hotelTypeId: null, sortBy: null, sortOrder: 'desc' }
   */
  getHotelsByOwner(params = {}) {
    const { page = 1, size = 3, cityId = null, districtId = null, businessStatus = null, hotelTypeId = null, sortBy = null, sortOrder = 'desc' } = params
    const queryParams = new URLSearchParams({ 
      page: page.toString(), 
      size: size.toString() 
    })
    if (cityId !== null && cityId !== undefined) {
      queryParams.append('cityId', cityId.toString())
    }
    if (districtId !== null && districtId !== undefined) {
      queryParams.append('districtId', districtId.toString())
    }
    if (businessStatus !== null && businessStatus !== undefined) {
      queryParams.append('businessStatus', businessStatus.toString())
    }
    if (hotelTypeId !== null && hotelTypeId !== undefined) {
      queryParams.append('hotelTypeId', hotelTypeId.toString())
    }
    if (sortBy !== null && sortBy !== undefined && sortBy !== '') {
      queryParams.append('sortBy', sortBy)
    }
    if (sortOrder !== null && sortOrder !== undefined && sortOrder !== '') {
      queryParams.append('sortOrder', sortOrder)
    }
    return apiRequest(`/hotels/owner?${queryParams}`)
  },

  /**
   * 獲取業者的單一飯店詳情
   * @param {number} hotelId - 飯店 ID
   * 從 JWT token 中獲取用戶 ID
   */
  getHotelForOwner(hotelId) {
    return apiRequest(`/hotels/owner/${hotelId}`)
  },

  /**
   * 獲取飯店詳情（公開）
   * @param {number} hotelId - 飯店 ID
   */
  getHotelById(hotelId) {
    return apiRequest(`/hotels/${hotelId}`)
  },

  /**
   * 新增飯店
   * @param {Object} hotelData - 飯店資料
   * 從 JWT token 中獲取用戶 ID
   */
  createHotel(hotelData) {
    return apiRequest(`/hotels`, {
      method: 'POST',
      body: JSON.stringify(hotelData),
    })
  },

  /**
   * 更新飯店
   * @param {number} hotelId - 飯店 ID
   * @param {Object} hotelData - 飯店資料
   * 從 JWT token 中獲取用戶 ID
   */
  updateHotel(hotelId, hotelData) {
    return apiRequest(`/hotels/${hotelId}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData),
    })
  },

  /**
   * 刪除飯店（邏輯刪除）
   * @param {number} hotelId - 飯店 ID
   * 從 JWT token 中獲取用戶 ID
   */
  deleteHotel(hotelId) {
    return apiRequest(`/hotels/${hotelId}`, {
      method: 'DELETE',
    })
  },
}

