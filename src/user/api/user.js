// src/api/user.js

// ✅ 統一使用同學寫好的 API 工具
import { apiRequest, apiUpload } from './request'

/**
 * 性別轉換工具
 * 資料庫定義（CHAR(1)）：
 * - M: 男 (Male)
 * - F: 女 (Female)
 * - O: 其他 (Other)
 * 
 * 注意：後端直接存儲 M/F/O 字符串，不需要數字轉換
 */

// 前端 'M'/'F'/'O' → 後端 'M'/'F'/'O'（直接返回，不需要轉換）
function convertGenderToBackend(gender) {
    // 確保返回的是有效的性別值
    if (gender === 'M' || gender === 'F' || gender === 'O') {
        return gender
    }
    return null
}

// 後端 'M'/'F'/'O' → 前端 'M'/'F'/'O'（直接返回，不需要轉換）
export function convertGenderToFrontend(gender) {
    // 如果已經是 M/F/O，直接返回
    if (gender === 'M' || gender === 'F' || gender === 'O') {
        return gender
    }
    // 如果是 null 或空字符串，返回空字符串
    if (!gender) {
        return ''
    }
    // 如果是數字（兼容舊數據），進行轉換
    const numberMap = {
        1: 'M', // 男
        0: 'F', // 女
        2: 'O', // 其他
    }
    return numberMap[gender] || ''
}

// 給前端下拉選單用
export function getGenderOptions() {
    return [
        { value: 'M', label: '男' },
        { value: 'F', label: '女' },
        { value: 'O', label: '其他' },
    ]
}

/**
 * 用戶 API（保留同學原本的風格，再把你的功能塞進來）
 */
export const userAPI = {
    /**
     * 註冊成為房東（更新用戶角色為 role_id = 3, HOTEL_OWNER）
     * 後端接口：POST /api/become-host
     */
    becomeHotelOwner() {
        return apiRequest('/become-host', {
            method: 'POST',
        })
    },

    /**
     * 獲取當前用戶資訊
     * 後端接口：GET /api/users/me
     */
    getCurrentUser() {
        return apiRequest('/users/me')
    },

    /**
     * 取得當前使用者的個人資料（給你自己的頁面用）
     * 後端接口：GET /api/user（不是 /api/users/me）
     */
    getUserProfile() {
        return apiRequest('/user')
    },

    /**
     * 更新個人資料
     * @param {Object} profileData - 個人資料
     * 後端接口：PUT /api/users/me
     */
    updateUserProfile(profileData) {
        const payload = {
            name: profileData.name || '',
            email: profileData.email,
            // 支援 phone 和 phoneNumber 兩種欄位名稱
            phone: profileData.phone || profileData.phoneNumber || '',
            // 支援 birthday 和 dateOfBirth 兩種欄位名稱
            birthday: profileData.birthday || profileData.dateOfBirth || '',
            address: profileData.address || '',
            // ✅ 性別直接使用 M/F/O，不需要轉換
            gender: convertGenderToBackend(profileData.gender),
        }

        return apiRequest('/users/me', {
            method: 'PUT',
            body: JSON.stringify(payload), // ✅ fetch 要用 body + JSON.stringify
            // Content-Type 在 apiRequest 裡已經預設 'application/json'
        })
    },

    /**
     * 上傳使用者頭像
     * @param {File} file - 圖片檔案
     * 後端接口：POST /api/users/me/avatar
     */
    uploadUserAvatar(file) {
        const formData = new FormData()
        formData.append('image', file)

        // ✅ 上傳用 apiUpload（已處理 FormData，不要自己設 Content-Type）
        return apiUpload('/users/me/avatar', formData)
    },

    /**
     * 變更密碼
     * @param {Object} passwordData - 密碼資料
     * 後端接口：PUT /api/users/me/password
     */
    changePassword(passwordData) {
        const payload = {
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
        }

        return apiRequest('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },
}

// ⭐ 讓你原本的寫法也能用，不會壞掉
// 例如：import { getUserProfile } from '@/api/user.js'
export const getUserProfile = () => userAPI.getUserProfile()
export const updateUserProfile = (profileData) =>
    userAPI.updateUserProfile(profileData)
export const uploadUserAvatar = (file) => userAPI.uploadUserAvatar(file)
export const changePassword = (passwordData) =>
    userAPI.changePassword(passwordData)
export const becomeHotelOwner = () => userAPI.becomeHotelOwner()
