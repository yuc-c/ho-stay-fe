// src/api/order.js
import axios from 'axios'
import useUserStore from '@/user/stores/user.js'

// 建立 axios 實例 - 使用空的 baseURL，讓 Vite proxy 處理
const request = axios.create({
    baseURL: 'http://192.168.25.152:8080',
    timeout: 10000,
    withCredentials: true
})

// 請求攔截器
request.interceptors.request.use(
    config => {
        // 從 user store 獲取 userId
        const userStore = useUserStore()
        const userId = userStore.userId

        // 如果沒有從 store 獲取到，嘗試從 localStorage 讀取
        if (!userId) {
            const storedUserId = localStorage.getItem('userId')
            if (storedUserId) {
                config.headers['userId'] = String(storedUserId)
            }
        } else {
            config.headers['userId'] = String(userId)
        }

        console.log('🔄 發送請求:', config.method?.toUpperCase(), config.url, config.params)
        return config
    },
    error => {
        console.error('❌ 請求攔截器錯誤:', error)
        return Promise.reject(error)
    }
)

// 回應攔截器
request.interceptors.response.use(
    response => {
        console.log('✅ 收到回應:', response.config.url, response.status)
        return response
    },
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('⏱️ 請求逾時:', error.config.url)
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.error('🔌 網路錯誤')
        } else if (error.response) {
            console.error('❌ 伺服器錯誤:', {
                url: error.config.url,
                status: error.response.status,
                data: error.response.data
            })
        }
        return Promise.reject(error)
    }
)

// ===== 訂單相關 API =====

/**
 * 取得訂單列表
 * ✅ 修正：從 /api/booking/list 改為 /api/user/booking/list
 */
export function getBookings(params) {
    return request({
        url: '/api/user/booking/list',
        method: 'get',
        params
    })
}

/**
 * 取得訂單詳細資料
 * ✅ 修正：從 /api/booking/${id} 改為 /api/user/booking/${id}
 */
export function getBookingById(id) {
    return request({
        url: `/api/user/booking/${id}`,
        method: 'get'
    })
}

/**
 * 取消訂單
 * ✅ 修正：method 從 'post' 改為 'put'
 * ✅ 修正：路徑從 /api/booking/{id}/cancel 改為 /api/user/booking/{id}/cancel
 * ⚠️ 注意：目前後端不接收 cancel_reason，如需儲存原因需後端配合修改
 */
export function cancelBooking(id, reason, reasonDetail) {
    return request({
        url: `/api/user/booking/${id}/cancel`,
        method: 'put',  // ✅ 修正
        // 暫時不傳 data，因為後端目前不接收
        // 如果未來後端支援，可以取消下面註解：
        // data: {
        //     cancel_reason: reason,
        //     cancel_reason_detail: reasonDetail
        // }
    })
}

/**
 * 發起綠界付款
 * ✅ 修正：method 從 'post' 改為 'get'
 * ✅ 新增：請求 JSON 格式的支付參數
 */
export function initiatePayment(bookingId) {
    return request({
        url: `/api/payment/initiate/${bookingId}`,
        method: 'get',  // ✅ 修正
        headers: {
            'Accept': 'application/json'  // ✅ 請求 JSON 格式
        }
    })
}

/**
 * 查詢付款狀態
 */
export function getPaymentStatus(bookingId) {
    return request({
        url: `/api/payment/status/${bookingId}`,
        method: 'get'
    })
}

/**
 * 取得取消原因選項
 */
export function getCancelReasons() {
    return [
        { value: 'schedule_change', label: '行程異動' },
        { value: 'found_better_option', label: '找到更好的選擇' },
        { value: 'price_issue', label: '價格考量' },
        { value: 'personal_reason', label: '個人因素' },
        { value: 'other', label: '其他原因' }
    ]
}

/**
 * 取得訂單狀態文字
 */
export function getBookingStatusText(status) {
    const statusMap = {
        1: '未付款',
        2: '已付款',
        3: '已取消',
        4: '已完成'
    }
    return statusMap[status] || '未知'
}

/**
 * 取得訂單狀態顏色 (給前端 UI 用)
 */
export function getBookingStatusColor(status) {
    const colorMap = {
        1: 'warning',   // 未付款 - 黃色
        2: 'success',   // 已付款 - 綠色
        3: 'danger',    // 已取消 - 紅色
        4: 'info'       // 已完成 - 藍色
    }
    return colorMap[status] || 'secondary'
}

// ===== 注意 =====
// 評論相關 API 已移至 src/api/review.js
// 請從該檔案 import 評論相關方法

export default request