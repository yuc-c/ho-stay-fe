// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

/**
 * 照片 API
 */
export const photoAPI = {
  /**
   * 獲取飯店的所有照片
   * @param {number} hotelId - 飯店 ID
   */
  getPhotosByHotelId(hotelId) {
    return apiRequest(`/photos/hotel/${hotelId}`)
  },

  /**
   * 根據 ID 獲取照片
   * @param {number} id - 照片 ID
   */
  getPhotoById(id) {
    return apiRequest(`/photos/${id}`)
  },

  /**
   * 創建照片
   * @param {number} hotelId - 飯店 ID
   * @param {Object} photoData - 照片資料
   */
  createPhoto(hotelId, photoData) {
    return apiRequest(`/photos/hotel/${hotelId}`, {
      method: 'POST',
      body: JSON.stringify(photoData),
    })
  },

  /**
   * 批次創建照片
   * @param {number} hotelId - 飯店 ID
   * @param {Array} photosData - 照片資料列表
   */
  createPhotos(hotelId, photosData) {
    return apiRequest(`/photos/hotel/${hotelId}/batch`, {
      method: 'POST',
      body: JSON.stringify(photosData),
    })
  },

  /**
   * 更新照片
   * @param {number} id - 照片 ID
   * @param {Object} photoData - 照片資料
   */
  updatePhoto(id, photoData) {
    return apiRequest(`/photos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(photoData),
    })
  },

  /**
   * 刪除照片
   * @param {number} id - 照片 ID
   */
  deletePhoto(id) {
    return apiRequest(`/photos/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * 設定封面照片
   * @param {number} hotelId - 飯店 ID
   * @param {number} photoId - 照片 ID
   */
  setCoverPhoto(hotelId, photoId) {
    return apiRequest(`/photos/hotel/${hotelId}/cover/${photoId}`, {
      method: 'PUT',
    })
  },

  /**
   * 調整照片順序
   * @param {number} id - 照片 ID
   * @param {number} displayOrder - 新的順序
   */
  updatePhotoOrder(id, displayOrder) {
    return apiRequest(`/photos/${id}/order`, {
      method: 'PUT',
      body: JSON.stringify({ displayOrder }),
    })
  },
}

