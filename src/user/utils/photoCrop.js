/**
 * 照片裁剪位置管理工具
 * 使用 localStorage 存儲每個照片的裁剪位置
 */

const STORAGE_KEY_PREFIX = 'photo_crop_position_'

/**
 * 獲取照片的裁剪位置
 * @param {number} photoId - 照片 ID
 * @returns {string} 裁剪位置，默認為 "center center"
 */
export function getCropPosition(photoId) {
  if (!photoId) return 'center center'
  
  const key = `${STORAGE_KEY_PREFIX}${photoId}`
  const stored = localStorage.getItem(key)
  
  return stored || 'center center'
}

/**
 * 設置照片的裁剪位置
 * @param {number} photoId - 照片 ID
 * @param {string} cropPosition - 裁剪位置（如 "center center"）
 */
export function setCropPosition(photoId, cropPosition) {
  if (!photoId || !cropPosition) return
  
  const key = `${STORAGE_KEY_PREFIX}${photoId}`
  localStorage.setItem(key, cropPosition)
}

/**
 * 刪除照片的裁剪位置（當照片被刪除時）
 * @param {number} photoId - 照片 ID
 */
export function removeCropPosition(photoId) {
  if (!photoId) return
  
  const key = `${STORAGE_KEY_PREFIX}${photoId}`
  localStorage.removeItem(key)
}

/**
 * 批量刪除飯店所有照片的裁剪位置
 * @param {Array<number>} photoIds - 照片 ID 列表
 */
export function removeCropPositions(photoIds) {
  if (!photoIds || !Array.isArray(photoIds)) return
  
  photoIds.forEach(photoId => {
    removeCropPosition(photoId)
  })
}

