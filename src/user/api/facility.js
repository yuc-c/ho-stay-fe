// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

/**
 * 設施 API
 */
export const facilityAPI = {
  /**
   * 獲取所有設施
   */
  getAllFacilities() {
    return apiRequest('/facilities')
  },

  /**
   * 根據 ID 獲取單一設施
   * @param {number} id - 設施 ID
   */
  getFacilityById(id) {
    return apiRequest(`/facilities/${id}`)
  },
}

/**
 * 飯店設施 API
 */
export const hotelFacilityAPI = {
  /**
   * 獲取飯店的所有設施
   * @param {number} hotelId - 飯店 ID
   */
  getHotelFacilities(hotelId) {
    return apiRequest(`/hotels/${hotelId}/facilities`)
  },

  /**
   * 更新飯店的設施
   * @param {number} hotelId - 飯店 ID
   * @param {Array<number>} facilityIds - 設施 ID 列表
   */
  updateHotelFacilities(hotelId, facilityIds) {
    return apiRequest(`/hotels/${hotelId}/facilities`, {
      method: 'PUT',
      body: JSON.stringify({ facilityIds }),
    })
  },
}

