// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

/**
 * 檢舉 API
 */
export const moderationAPI = {
    /**
     * 檢舉評論
     * @param {Object} reportData - 檢舉資料
     * @param {number} reportData.reviewId - 被檢舉的評論ID
     * @param {number} reportData.reviewAuthorId - 評論作者ID
     * @param {string} reportData.reason - 檢舉原因 (ABUSE, SPAM, ADVERTISING, OFFENSIVE, OTHER)
     * @param {number} reportData.reporterId - 檢舉人ID
     * @param {number} reportData.moderatorId - 審核人員ID（預設為1，表示待審核）
     * @param {string} reportData.status - 狀態（預設為 PENDING）
     */
    reportReview(reportData) {
        return apiRequest('/moderation-actions', {
            method: 'POST',
            body: JSON.stringify(reportData),
        })
    },
}

