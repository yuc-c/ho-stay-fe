// src/api/user.js
import api from '../../user/api/axios'

/**
 * 取得當前使用者的個人資料
 */
export const getUserProfile = async () => {
    return api.get('/users/me')
}

/**
 * 更新個人資料
 * @param {Object} profileData - 個人資料
 */
export const updateUserProfile = async (profileData) => {
    // 將前端格式轉換為後端需要的格式
    const payload = {
        name: profileData.name || '',
        email: profileData.email,
        phone: profileData.phone,
        birthday: profileData.birthday,
        address: profileData.address,
        gender: convertGenderToBackend(profileData.gender)
    }

    return api.put('/users/me', payload)
}

/**
 * 上傳使用者頭像
 * @param {File} file - 圖片檔案
 */
export const uploadUserAvatar = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    return api.post('/users/me/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 變更密碼
 * @param {Object} passwordData - 密碼資料
 */
export const changePassword = async (passwordData) => {
    return api.put('/users/me/password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
    })
}

// ============================================
// 工具函數：性別轉換
// ============================================

/**
 * 將前端性別格式轉換為後端格式
 * 前端: 'M'/'F'/'O' → 後端: 1/0/2
 * 
 * ✅ 重要：必須與後端 UserProfileController 一致
 * - 0: 女 (Female)
 * - 1: 男 (Male)
 * - 2: 其他 (Other)
 */
function convertGenderToBackend(gender) {
    const genderMap = {
        'M': 1,  // 男
        'F': 0,  // 女 ✅ 修正：從 2 改為 0
        'O': 2   // 其他 ✅ 修正：從 0 改為 2
    }
    return genderMap[gender] || null
}

/**
 * 將後端性別格式轉換為前端格式
 * 後端: 1/0/2 → 前端: 'M'/'F'/'O'
 */
export function convertGenderToFrontend(gender) {
    const genderMap = {
        1: 'M',  // 男
        0: 'F',  // 女 ✅ 修正：從 2 改為 0
        2: 'O'   // 其他 ✅ 修正：從 0 改為 2
    }
    return genderMap[gender] || ''
}

/**
 * 取得性別選項 (給前端下拉選單用)
 */
export function getGenderOptions() {
    return [
        { value: 'M', label: '男' },
        { value: 'F', label: '女' },
        { value: 'O', label: '其他' }
    ]
}