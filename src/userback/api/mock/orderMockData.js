// src/api/mock/orderMockData.js

export const mockBookings = [
    {
        // 訂單基本資訊
        id: 1,
        user_id: 1,
        start_date: '2024-12-01',
        end_date: '2024-12-03',
        night: 2,
        payment_type: '信用卡',
        payment_date: '2024-11-25T14:30:00',
        booking_date: '2024-11-25T14:30:00',
        check_in_time: '15:00:00',
        request: null,
        coupon_id: null,
        lead_guest: '張小明',
        updated_time: '2024-11-03T12:00:00',
        status: 4, // 1:未付款, 2:已付款, 3:取消, 4:完成
        total_price: 6000,

        // 飯店資訊
        hotel_id: 1,
        hotel_name: '台北五星大飯店',
        hotel_phone: '02-12345678',
        hotel_address: '台北市信義區信義路五段1號',

        // 房間資訊
        room_id: 101,
        room_name: '豪華雙人房',
        room_type: '雙人房',

        // 取消政策
        cancellation_policy: {
            free_cancellation_days: 7, // 入住前 7 天可免費取消
            penalty_rate: 0.5 // 超過期限取消收取 50% 手續費
        },

        // 前端計算用
        can_review: true,
        has_review: false,
        can_cancel: false, // 已完成不可取消
        days_until_checkin: -18, // 負數表示已過入住日期
        statusText: '已完成'
    },
    {
        id: 2,
        user_id: 1,
        start_date: '2024-10-15',
        end_date: '2024-10-16',
        night: 1,
        payment_type: '信用卡',
        payment_date: '2024-10-10T10:20:00',
        booking_date: '2024-10-10T10:20:00',
        check_in_time: '14:00:00',
        request: '需要安靜的房間',
        coupon_id: null,
        lead_guest: '李小華',
        updated_time: '2024-10-16T11:00:00',
        status: 4,
        total_price: 2000,

        hotel_id: 2,
        hotel_name: '台北商務旅館',
        hotel_phone: '02-23456789',
        hotel_address: '台北市中山區南京東路二段100號',

        room_id: 201,
        room_name: '標準單人房',
        room_type: '單人房',

        cancellation_policy: {
            free_cancellation_days: 3,
            penalty_rate: 0.3
        },

        can_review: false,
        has_review: true,
        can_cancel: false,
        days_until_checkin: -35,
        statusText: '已完成'
    },
    {
        id: 3,
        user_id: 1,
        start_date: '2024-12-25',
        end_date: '2024-12-27',
        night: 2,
        payment_type: '信用卡',
        payment_date: '2024-11-20T16:45:00', // 已付款
        booking_date: '2024-11-20T16:45:00',
        check_in_time: null,
        request: '需要嬰兒床',
        coupon_id: null,
        lead_guest: '王大明',
        updated_time: '2024-11-21T09:30:00',
        status: 3, // 已取消
        total_price: 8000,

        hotel_id: 3,
        hotel_name: '台北親子度假飯店',
        hotel_phone: '02-34567890',
        hotel_address: '台北市大安區忠孝東路四段200號',

        room_id: 301,
        room_name: '家庭四人房',
        room_type: '家庭房',

        cancellation_policy: {
            free_cancellation_days: 7,
            penalty_rate: 0.5
        },

        // 取消資訊
        cancel_reason: '臨時有事',
        cancel_date: '2024-11-21T09:30:00',

        // 退款資訊
        refund_status: 'processing', // processing, completed, failed
        refund_amount: 7600, // 扣除手續費後
        refund_date: null,
        refund_progress: 50, // 退款進度 0-100

        can_review: false,
        has_review: false,
        can_cancel: false,
        days_until_checkin: 6,
        statusText: '已取消(退款處理中)'
    },
    {
        id: 4,
        user_id: 1,
        start_date: '2024-12-05',
        end_date: '2024-12-07',
        night: 2,
        payment_type: '信用卡',
        payment_date: '2024-11-18T10:00:00',
        booking_date: '2024-11-18T10:00:00',
        check_in_time: '15:00:00',
        request: '高樓層，靠窗',
        coupon_id: null,
        lead_guest: '陳小美',
        updated_time: '2024-11-18T10:00:00',
        status: 2, // 已付款，待入住
        total_price: 6000,

        hotel_id: 1,
        hotel_name: '台北五星大飯店',
        hotel_phone: '02-12345678',
        hotel_address: '台北市信義區信義路五段1號',

        room_id: 102,
        room_name: '豪華雙人房',
        room_type: '雙人房',

        cancellation_policy: {
            free_cancellation_days: 7,
            penalty_rate: 0.5
        },

        can_review: false,
        has_review: false,
        can_cancel: true, // 距離入住還有 16 天，可以取消
        days_until_checkin: 16,
        statusText: '已付款'
    },
    {
        id: 5,
        user_id: 1,
        start_date: '2024-11-22',
        end_date: '2024-11-24',
        night: 2,
        payment_type: '現金',
        payment_date: null, // 未付款
        booking_date: '2024-11-15T09:30:00',
        check_in_time: '14:30:00',
        request: null,
        coupon_id: null,
        lead_guest: '林小芬',
        updated_time: '2024-11-15T09:30:00',
        status: 1, // 未付款
        total_price: 4000,

        hotel_id: 4,
        hotel_name: '台北精品旅店',
        hotel_phone: '02-45678901',
        hotel_address: '台北市松山區南京東路三段300號',

        room_id: 401,
        room_name: '商務單人房',
        room_type: '單人房',

        cancellation_policy: {
            free_cancellation_days: 3,
            penalty_rate: 0.2
        },

        can_review: false,
        has_review: false,
        can_cancel: true, // 未付款可以取消
        days_until_checkin: 3,
        statusText: '未付款'
    },
    {
        id: 6,
        user_id: 1,
        start_date: '2024-11-21',
        end_date: '2024-11-22',
        night: 1,
        payment_type: '信用卡',
        payment_date: '2024-11-19T10:00:00',
        booking_date: '2024-11-19T10:00:00',
        check_in_time: '15:00:00',
        request: null,
        coupon_id: null,
        lead_guest: '黃小明',
        updated_time: '2024-11-19T10:00:00',
        status: 2, // 已付款
        total_price: 2500,

        hotel_id: 2,
        hotel_name: '台北商務旅館',
        hotel_phone: '02-23456789',
        hotel_address: '台北市中山區南京東路二段100號',

        room_id: 202,
        room_name: '標準雙人房',
        room_type: '雙人房',

        cancellation_policy: {
            free_cancellation_days: 3,
            penalty_rate: 0.3
        },

        can_review: false,
        has_review: false,
        can_cancel: false, // 距離入住只剩 2 天，已超過取消期限(3天)
        days_until_checkin: 2,
        statusText: '已付款(不可取消)'
    }
]

export const mockReviews = [
    {
        id: 1,
        user_id: 1,
        booking_id: 2,
        rating: 5,
        comment: '房間很乾淨，服務態度很好！早餐也很豐富，下次還會再來。',
        is_edited: 0,
        is_visible: 1,
        created_date: '2024-10-17T10:30:00',
        updated_date: '2024-10-17T10:30:00',
        reply: '非常感謝您的肯定與支持，我們會繼續努力提供更好的服務，期待您下次再來！',
        reply_created_date: '2024-10-18T14:20:00',
        reply_updated_date: '2024-10-18T14:20:00',
        user_name: '李小華',
        room_name: '標準單人房',
        hotel_name: '台北商務旅館'
    }
]

// 取消原因選項
export const cancelReasons = [
    { value: 'wrong_info', label: '訂錯房型/日期/人數' },
    { value: 'emergency', label: '臨時有事' },
    { value: 'found_better', label: '找到更好的選擇' },
    { value: 'weather', label: '天氣因素' },
    { value: 'health', label: '健康因素' },
    { value: 'other', label: '其他原因' }
]