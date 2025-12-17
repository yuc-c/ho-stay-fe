// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

/**
 * 飯店類型 API
 */
export const hotelTypeAPI = {
    /**
     * 獲取所有飯店類型
     * GET /api/hotel-types
     * 
     * @returns {Promise<Array>} 飯店類型列表
     */
    getAllHotelTypes() {
        return apiRequest('/hotel-types')
    },

    /**
     * 根據 ID 獲取單一飯店類型
     * GET /api/hotel-types/{id}
     * 
     * @param {number} id - 飯店類型 ID
     * @returns {Promise<Object>} 飯店類型資料
     */
    getHotelTypeById(id) {
        return apiRequest(`/hotel-types/${id}`)
    }
}

