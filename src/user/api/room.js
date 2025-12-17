// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

/**
 * 房型 API
 */
export const roomAPI = {
  /**
   * 根據飯店 ID 獲取所有房型（公開API，會過濾停業飯店）
   * @param {number} hotelId - 飯店 ID
   */
  getRoomsByHotelId(hotelId) {
    return apiRequest(`/rooms/hotel/${hotelId}`)
  },

  /**
   * 根據飯店 ID 獲取所有房型（後台管理用，不過濾停業狀態）
   * @param {number} hotelId - 飯店 ID
   */
  getRoomsByHotelIdForOwner(hotelId) {
    return apiRequest(`/rooms/owner/hotel/${hotelId}`)
  },

  /**
   * 根據 ID 獲取單一房型
   * @param {number} roomId - 房型 ID
   */
  getRoomById(roomId) {
    return apiRequest(`/rooms/${roomId}`)
  },

  /**
   * 新增房型
   * @param {number} hotelId - 飯店 ID
   * @param {Object} roomData - 房型資料
   */
  createRoom(hotelId, roomData) {
    return apiRequest(`/rooms?hotelId=${hotelId}`, {
      method: 'POST',
      body: JSON.stringify(roomData),
    })
  },

  /**
   * 更新房型
   * @param {number} roomId - 房型 ID
   * @param {Object} roomData - 房型資料
   */
  updateRoom(roomId, roomData) {
    return apiRequest(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    })
  },

  /**
   * 刪除房型
   * @param {number} roomId - 房型 ID
   */
  deleteRoom(roomId) {
    return apiRequest(`/rooms/${roomId}`, {
      method: 'DELETE',
    })
  },
}

/**
 * 房型分類 API
 */
export const roomTypeAPI = {
  /**
   * 獲取所有房型分類
   */
  getAllRoomTypes() {
    return apiRequest('/room-types')
  },

  /**
   * 根據 ID 獲取單一房型分類
   * @param {number} id - 房型分類 ID
   */
  getRoomTypeById(id) {
    return apiRequest(`/room-types/${id}`)
  },
}

/**
 * 床型 API
 */
export const bedTypeAPI = {
  /**
   * 獲取所有床型
   */
  getAllBedTypes() {
    return apiRequest('/bed-types')
  },

  /**
   * 根據 ID 獲取單一床型
   * @param {number} id - 床型 ID
   */
  getBedTypeById(id) {
    return apiRequest(`/bed-types/${id}`)
  },
}

/**
 * 房型床型配置 API
 */
export const roomTypeBedTypeAPI = {
  /**
   * 獲取所有房型床型配置
   */
  getAllRoomTypeBedTypes() {
    return apiRequest('/room-type-bed-types')
  },

  /**
   * 根據房型 ID 獲取配置
   * @param {number} roomTypeId - 房型 ID
   */
  getRoomTypeBedTypesByRoomTypeId(roomTypeId) {
    return apiRequest(`/room-type-bed-types/room-type/${roomTypeId}`)
  },
}

