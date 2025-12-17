// src/user/api/review.js
import api from "./axios";
// 暫時移除 mock，使用真實 API
// import { mockReviews } from "../../userback/api/mock/reviewMockData";

// 暫時移除 mock，使用真實 API
const USE_MOCK = false; // import.meta.env.VITE_USE_MOCK_API === "true";

/**
 * 取得單一評論（用 reviewId 查詢）
 * 後端路徑: GET /api/reviews/{reviewId}
 */
export const getReviewById = async (reviewId) => {
    // 暫時移除 mock，使用真實 API
    // if (USE_MOCK) {
    //     const review = mockReviews.find((r) => r.id === Number(reviewId));
    //     return Promise.resolve({ data: review || null });
    // }

    return api.get(`/reviews/${reviewId}`);
};

/**
 * 依訂單取得評論
 * ✅ 修正：從 /api/orders/${bookingId}/review 改為 /api/reviews/booking/${bookingId}
 * 後端路徑: GET /api/reviews/booking/{bookingId}
 */
export const getReviewByBookingId = async (bookingId) => {
    // 暫時移除 mock，使用真實 API
    // if (USE_MOCK) {
    //     const review = mockReviews.find((r) => r.bookingId === Number(bookingId));
    //     return Promise.resolve({ data: review || null });
    // }

    return api.get(`/reviews/booking/${bookingId}`);
};

/**
 * 建立評論
 * ✅ 修正：
 * 1. 從 /api/orders/${bookingId}/review 改為 /api/reviews
 * 2. 加上 userId 參數（後端需要）
 * 
 * 後端路徑: POST /api/reviews?userId={userId}
 * 
 * @param {number} userId - 使用者 ID
 * @param {number} bookingId - 訂單 ID
 * @param {Object} payload - 評論內容 { rating, comment }
 */
export const createReview = async (userId, bookingId, payload) => {
    if (USE_MOCK) {
        const newReview = {
            id: Date.now(),
            bookingId: Number(bookingId),
            userId: Number(userId),
            ...payload,
            createdDate: new Date().toISOString(),
        };
        mockReviews.push(newReview);
        return Promise.resolve({ data: newReview });
    }

    // 後端需要 userId 作為 query parameter
    return api.post(`/reviews?userId=${userId}`, {
        bookingId: Number(bookingId),
        rating: payload.rating,
        comment: payload.comment
    });
};

/**
 * 更新評論
 * 後端路徑: PUT /api/reviews/{reviewId}?userId={userId}
 * 
 * @param {number} reviewId - 評論 ID
 * @param {number} userId - 使用者 ID
 * @param {Object} payload - 更新內容 { rating, comment }
 */
export const updateReview = async (reviewId, userId, payload) => {
    if (USE_MOCK) {
        const review = mockReviews.find((r) => r.id === Number(reviewId));
        if (review) {
            Object.assign(review, payload);
            review.isEdited = true;
            review.updatedDate = new Date().toISOString();
        }
        return Promise.resolve({ data: review });
    }

    return api.put(`/reviews/${reviewId}?userId=${userId}`, payload);
};

/**
 * 刪除評論
 * 後端路徑: DELETE /api/reviews/{reviewId}?userId={userId}
 */
export const deleteReview = async (reviewId, userId) => {
    if (USE_MOCK) {
        const index = mockReviews.findIndex((r) => r.id === Number(reviewId));
        if (index > -1) {
            mockReviews.splice(index, 1);
        }
        return Promise.resolve({ data: { success: true } });
    }

    return api.delete(`/reviews/${reviewId}?userId=${userId}`);
};

/**
 * 業者回覆評論
 * ✅ 修正：加上 hotelOwnerId query parameter
 * 後端路徑: POST /api/reviews/{reviewId}/reply?hotelOwnerId={hotelOwnerId}
 * 
 * @param {number} reviewId - 評論 ID
 * @param {number} hotelOwnerId - 業者 ID
 * @param {Object} payload - 回覆內容 { reply }
 */
export const replyReview = async (reviewId, hotelOwnerId, payload) => {
    if (USE_MOCK) {
        const review = mockReviews.find((r) => r.id === Number(reviewId));
        if (review) {
            review.reply = payload.reply;
            review.replyCreatedDate = new Date().toISOString();
        }
        return Promise.resolve({ data: review });
    }

    return api.post(
        `/reviews/${reviewId}/reply?hotelOwnerId=${hotelOwnerId}`,
        payload
    );
};

/**
 * 取得用戶的所有評論
 * 後端路徑: GET /api/reviews/user/{userId}
 */
export const getUserReviews = async (userId) => {
    if (USE_MOCK) {
        const reviews = mockReviews.filter((r) => r.userId === Number(userId));
        return Promise.resolve({ data: reviews });
    }

    return api.get(`/reviews/user/${userId}`);
};

/**
 * 取得飯店的所有評論
 * 後端路徑: GET /api/reviews/hotel/{hotelId}
 */
export const getHotelReviews = async (hotelId) => {
    if (USE_MOCK) {
        const reviews = mockReviews.filter((r) => r.hotelId === Number(hotelId));
        return Promise.resolve({ data: reviews });
    }

    return api.get(`/reviews/hotel/${hotelId}`);
};

/**
 * 檢查用戶是否可以對某個訂單評論
 * 後端路徑: GET /api/reviews/can-review/{bookingId}?userId={userId}
 */
export const canReviewBooking = async (bookingId, userId) => {
    if (USE_MOCK) {
        // Mock: 假設沒評論過的都可以評
        const hasReview = mockReviews.some(
            (r) => r.bookingId === Number(bookingId) && r.userId === Number(userId)
        );
        return Promise.resolve({ data: { canReview: !hasReview } });
    }

    return api.get(`/reviews/can-review/${bookingId}?userId=${userId}`);
};