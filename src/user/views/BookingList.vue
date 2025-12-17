<template>
  <div>
    <!-- 主要內容 -->
    <div class="container py-4">
      <!-- 標題 -->
      <div class="row mb-4">
        <div class="col">
          <h2><i class="bi bi-calendar-check"></i> 我的訂單</h2>
          <p class="text-muted">查看和管理您的住宿訂單</p>
        </div>
      </div>

      <!-- 狀態篩選按鈕 -->
      <div class="row mb-3">
        <div class="col">
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn btn-outline-primary filter-btn"
              :class="{ active: currentStatus === '' }"
              @click="filterByStatus('')">
              <i class="bi bi-list-ul"></i> 全部
            </button>
            <button 
              type="button" 
              class="btn btn-outline-warning filter-btn"
              :class="{ active: currentStatus === 1 }"
              @click="filterByStatus(1)">
              <i class="bi bi-clock"></i> 未付款
            </button>
            <button 
              type="button" 
              class="btn btn-outline-success filter-btn"
              :class="{ active: currentStatus === 2 }"
              @click="filterByStatus(2)">
              <i class="bi bi-check-circle"></i> 已付款
            </button>
            <button 
              type="button" 
              class="btn btn-outline-danger filter-btn"
              :class="{ active: currentStatus === 3 }"
              @click="filterByStatus(3)">
              <i class="bi bi-x-circle"></i> 已取消
            </button>
            <button 
              type="button" 
              class="btn btn-outline-info filter-btn"
              :class="{ active: currentStatus === 4 }"
              @click="filterByStatus(4)">
              <i class="bi bi-check-all"></i> 已完成
            </button>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-show="isLoading" class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <p class="mt-2">載入訂單資料中...</p>
      </div>

      <!-- 訂單列表 -->
      <div v-show="!isLoading" class="row">
        <div 
          v-for="booking in bookings" 
          :key="booking.id" 
          class="col-md-6 col-lg-4 mb-3">
          <div class="card booking-card h-100">
            
            <!-- 飯店圖片 -->
            <div class="card-img-container">
              <img 
                :src="getHotelImage(booking)" 
                :alt="booking.hotel_name"
                class="card-img-top"
                @error="handleImageError">
              <span class="badge status-badge position-absolute" :class="getStatusClass(booking.status)">
                {{ booking.statusText || getStatusText(booking.status) }}
              </span>
            </div>
            
            <div class="card-body">
              <!-- 飯店名稱 -->
              <h5 class="card-title text-primary mb-2">
                <i class="bi bi-building"></i> {{ booking.hotel_name }}
              </h5>
              
              <!-- 訂單編號 -->
              <p class="text-muted small mb-3">訂單 #{{ booking.id }}</p>
              
              <!-- 關鍵資訊 -->
              <div class="booking-info-simple">
                <p class="mb-2">
                  <i class="bi bi-calendar-range text-primary"></i> 
                  <strong>入住：</strong>{{ formatDate(booking.start_date) }}
                </p>
                <p class="mb-2">
                  <i class="bi bi-calendar-check text-success"></i> 
                  <strong>退房：</strong>{{ formatDate(booking.end_date) }}
                </p>
                <p class="mb-3">
                  <i class="bi bi-moon-stars text-info"></i> 
                  <strong>{{ booking.night }} 晚</strong>
                </p>
              </div>

              <hr>
              
              <!-- 價格 -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted">總金額</span>
                <h4 class="text-primary mb-0">NT$ {{ (booking.total_price || 0).toLocaleString() }}</h4>
              </div>
              
              <!-- 付款狀態提示 -->
              <div v-if="booking.payment_date" class="alert alert-success py-2 px-2 small mb-3">
                <i class="bi bi-check-circle"></i> 已付款：{{ formatDateTime(booking.payment_date) }}
              </div>
              <div v-else-if="booking.status === 1" class="alert alert-warning py-2 px-2 small mb-3">
                <i class="bi bi-exclamation-circle"></i> 尚未付款
              </div>
              
              <!-- 退款進度條 -->
              <div v-if="booking.status === 3 && booking.refund_status" class="refund-info mb-3">
                <p class="small mb-1">
                  <i class="bi bi-arrow-return-left"></i> 
                  <strong>退款：</strong>NT$ {{ booking.refund_amount?.toLocaleString() }}
                </p>
                <div class="progress" style="height: 15px;">
                  <div 
                    class="progress-bar progress-bar-striped"
                    :class="getRefundProgressClass(booking.refund_status)"
                    role="progressbar" 
                    :style="{ width: booking.refund_progress + '%' }">
                    {{ booking.refund_progress }}%
                  </div>
                </div>
              </div>
              
              <!-- 操作按鈕 -->
              <div class="d-grid gap-2">
                <button 
                  class="btn btn-outline-primary btn-sm" 
                  @click="viewDetail(booking.id)">
                  <i class="bi bi-eye"></i> 查看詳細
                </button>
                
                <button 
                  v-if="booking.status === 1"
                  class="btn btn-success btn-sm"
                  @click="handlePayment(booking.id)">
                  <i class="bi bi-credit-card-2-front"></i> 線上支付
                </button>
                
                <!-- 只有已完成(status=4)的才顯示評論按鈕（進入詳情模態框） -->
                <!-- 如果已有評論（包括只有評分沒有文字），顯示"查看評論"（紫色）；如果未評論，顯示"我要評論"（黃色） -->
                <button 
                  v-if="booking.status === 4"
                  :class="booking.has_review ? 'btn btn-sm btn-review-view' : 'btn btn-warning btn-sm'"
                  @click="viewDetail(booking.id)">
                  <i class="bi bi-star"></i> {{ booking.has_review ? '查看評論' : '我要評論' }}
                </button>
                
                <button 
                  v-if="booking.can_cancel" 
                  class="btn btn-outline-danger btn-sm" 
                  @click="showCancelModal(booking)">
                  <i class="bi bi-x-circle"></i> 取消訂單
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="!isLoading && bookings.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <h4>目前沒有訂單</h4>
        <p class="text-muted">您還沒有任何訂單記錄</p>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="row mt-4">
        <div class="col">
          <nav aria-label="訂單分頁">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
                  上一頁
                </a>
              </li>
              
              <li 
                v-for="page in totalPages" 
                :key="page" 
                class="page-item"
                :class="{ active: page - 1 === currentPage }">
                <a class="page-link" href="#" @click.prevent="goToPage(page - 1)">
                  {{ page }}
                </a>
              </li>
              
              <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
                  下一頁
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 訂單詳細 Modal -->
    <div 
      v-if="selectedBooking" 
      class="modal fade show d-block" 
      tabindex="-1"
      @click.self="selectedBooking = null">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-receipt"></i> 訂單詳細資料
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="selectedBooking = null">
            </button>
          </div>
          
          <div class="modal-body">
            <!-- 飯店圖片 -->
            <div class="hotel-image-section mb-4">
              <img 
                :src="getHotelImage(selectedBooking)" 
                :alt="selectedBooking.hotel_name"
                class="hotel-detail-image"
                @error="handleImageError">
            </div>

            <!-- 飯店資訊 -->
            <div class="mb-4">
              <h6 class="border-bottom pb-2"><i class="bi bi-building"></i> 飯店資訊</h6>
              <div class="hotel-detail-info">
                <h5 class="text-primary mb-2">{{ selectedBooking.hotel_name }}</h5>
                <p class="mb-1">
                  <i class="bi bi-telephone"></i> {{ selectedBooking.hotel_phone }}
                </p>
                <p class="mb-0">
                  <i class="bi bi-geo-alt"></i> {{ selectedBooking.hotel_address }}
                </p>
              </div>
            </div>

            <div class="row">
              <!-- 訂單資訊 -->
              <div class="col-md-6">
                <h6 class="border-bottom pb-2"><i class="bi bi-card-list"></i> 訂單資訊</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td width="40%"><strong>訂單編號：</strong></td>
                      <td>#{{ selectedBooking.id }}</td>
                    </tr>
                    <tr>
                      <td><strong>訂單狀態：</strong></td>
                      <td>
                        <span class="badge" :class="getStatusClass(selectedBooking.status)">
                          {{ getStatusText(selectedBooking.status) }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>訂單日期：</strong></td>
                      <td>{{ formatDateTime(selectedBooking.booking_date) }}</td>
                    </tr>
                    <tr>
                      <td><strong>最後更新：</strong></td>
                      <td>{{ formatDateTime(selectedBooking.updated_time) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 住宿資訊 -->
              <div class="col-md-6">
                <h6 class="border-bottom pb-2"><i class="bi bi-calendar3"></i> 住宿資訊</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td width="40%"><strong>入住日期：</strong></td>
                      <td>{{ formatDate(selectedBooking.start_date) }}</td>
                    </tr>
                    <tr>
                      <td><strong>退房日期：</strong></td>
                      <td>{{ formatDate(selectedBooking.end_date) }}</td>
                    </tr>
                    <tr>
                      <td><strong>住宿天數：</strong></td>
                      <td>{{ selectedBooking.night }} 晚</td>
                    </tr>
                    <tr>
                      <td><strong>入住時間：</strong></td>
                      <td>{{ formatTime(selectedBooking.check_in_time) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 房型資訊 -->
            <div class="mb-4">
              <h6 class="border-bottom pb-2"><i class="bi bi-door-open"></i> 房型資訊</h6>
              <table class="table table-sm table-bordered" v-if="selectedBooking.rooms && selectedBooking.rooms.length > 0">
                <thead class="table-light">
                  <tr>
                    <th>房型名稱</th>
                    <th>床型</th>
                    <th>數量</th>
                    <th>單價</th>
                    <th>小計</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(room, index) in selectedBooking.rooms" :key="index">
                    <td>{{ room.room_name }}</td>
                    <td>{{ room.bed_type }}</td>
                    <td>{{ room.quantity }}</td>
                    <td>NT$ {{ room.price.toLocaleString() }}</td>
                    <td>NT$ {{ (room.subtotal || (room.price * room.quantity)).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">暫無房型資訊</p>
            </div>

            <!-- 付款資訊 -->
            <div class="mb-4">
              <h6 class="border-bottom pb-2"><i class="bi bi-credit-card"></i> 付款資訊</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td width="30%"><strong>付款方式：</strong></td>
                    <td>{{ selectedBooking.payment_type }}</td>
                  </tr>
                  <tr v-if="selectedBooking.payment_date">
                    <td><strong>付款時間：</strong></td>
                    <td>{{ formatDateTime(selectedBooking.payment_date) }}</td>
                  </tr>
                  <tr v-if="selectedBooking.ecpay_trade_no">
                    <td><strong>交易編號：</strong></td>
                    <td>{{ selectedBooking.ecpay_trade_no }}</td>
                  </tr>
                  <tr class="table-info">
                    <td><strong>訂單總金額：</strong></td>
                    <td><strong class="text-primary">NT$ {{ (selectedBooking.total_price || 0).toLocaleString() }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 特殊需求 -->
            <div class="mb-4" v-if="selectedBooking.request !== undefined && selectedBooking.request !== null">
              <h6 class="border-bottom pb-2"><i class="bi bi-chat-left-text"></i> 特殊需求</h6>
              
              <!-- 檢視模式 -->
              <div v-if="!isEditingRequest" class="request-view">
                <p class="mb-2">{{ selectedBooking.request || '無特殊需求' }}</p>
                <button 
                  v-if="selectedBooking.status === 1"
                  class="btn btn-sm btn-outline-primary"
                  @click="startEditRequest">
                  <i class="bi bi-pencil"></i> 編輯需求
                </button>
              </div>
              
              <!-- 編輯模式 -->
              <div v-else class="request-edit">
                <textarea 
                  v-model="editedRequest"
                  class="form-control mb-2"
                  rows="3"
                  placeholder="請輸入您的特殊需求..."
                  :disabled="isSavingRequest">
                </textarea>
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-sm btn-primary"
                    @click="saveRequest"
                    :disabled="isSavingRequest">
                    <i class="bi bi-check-lg"></i> {{ isSavingRequest ? '儲存中...' : '儲存' }}
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary"
                    @click="cancelEditRequest"
                    :disabled="isSavingRequest">
                    <i class="bi bi-x-lg"></i> 取消
                  </button>
                </div>
              </div>
            </div>

            <!-- 取消資訊 -->
            <div v-if="selectedBooking.status === 3" class="mb-4">
              <h6 class="border-bottom pb-2"><i class="bi bi-x-circle"></i> 取消資訊</h6>
              <div class="alert alert-warning">
                <p class="mb-1"><strong>取消時間：</strong>{{ formatDateTime(selectedBooking.cancelled_at) }}</p>
                <p class="mb-1" v-if="selectedBooking.cancel_reason">
                  <strong>取消原因：</strong>{{ getCancelReasonLabel(selectedBooking.cancel_reason) }}
                </p>
                <p class="mb-0" v-if="selectedBooking.cancel_reason_detail">
                  <strong>詳細說明：</strong>{{ selectedBooking.cancel_reason_detail }}
                </p>
              </div>
            </div>

            <!-- 評論區域 -->
            <!-- 所有已完成(status=4)的訂單都顯示評論區域 -->
            <div v-if="selectedBooking && selectedBooking.status === 4" class="mb-4">
              <h6 class="border-bottom pb-2">
                <i class="bi bi-star"></i> 
                {{ currentReview ? '我的評論' : '撰寫評論' }}
              </h6>
              
              <!-- 如果有評論且不在編輯模式，顯示評論內容 -->
              <div v-if="currentReview && !isEditingReview" class="card bg-light">
                <div class="card-body">
                  <!-- 評分顯示 -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">評分</label>
                    <div class="d-flex justify-content-center gap-2">
                      <span
                        v-for="star in 5"
                        :key="star"
                        class="fs-3"
                        :class="{ 'text-warning': star <= currentReview.rating, 'text-muted': star > currentReview.rating }"
                      >
                        ★
                      </span>
                    </div>
                    <div class="text-center mt-2">
                      <span class="badge bg-warning text-dark">
                        {{ getRatingText(currentReview.rating) }}
                      </span>
                    </div>
                  </div>

                  <!-- 評論內容顯示 -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">評論內容</label>
                    <div class="p-3 bg-white rounded border">
                      <p class="mb-0" style="white-space: pre-wrap;">{{ currentReview.comment || '無評論內容' }}</p>
                    </div>
                  </div>

                  <!-- 評論時間 -->
                  <div class="mb-3 text-muted small">
                    <i class="bi bi-calendar"></i> 
                    發表時間：{{ formatDate(currentReview.createdDate) || formatDate(currentReview.created_date) }}
                    <span v-if="currentReview.updatedDate || currentReview.updated_date" class="ms-3">
                      <i class="bi bi-pencil"></i> 
                      最後更新：{{ formatDate(currentReview.updatedDate) || formatDate(currentReview.updated_date) }}
                    </span>
                  </div>

                  <!-- 業者回覆（如果有） -->
                  <div v-if="currentReview.ownerReply || currentReview.owner_reply" class="alert alert-success mt-3 mb-0">
                    <strong><i class="bi bi-reply"></i> 業者回覆：</strong>
                    <p class="mb-0 mt-2" style="white-space: pre-wrap;">{{ currentReview.ownerReply || currentReview.owner_reply }}</p>
                  </div>

                  <!-- 編輯按鈕：只有當評論內容為空或 null 時才顯示 -->
                  <div v-if="!currentReview.comment || currentReview.comment.trim() === ''" class="d-flex gap-2 mt-3">
                    <button
                      class="btn btn-primary btn-sm"
                      @click="resetReviewForm">
                      <i class="bi bi-pencil"></i> 修改評論
                    </button>
                  </div>
                  
                  <!-- 如果評論已有內容，顯示提示訊息 -->
                  <div v-else class="alert alert-info mt-3 mb-0">
                    <i class="bi bi-info-circle"></i> 
                    評論已提交，無法再修改。
                  </div>
                </div>
              </div>

              <!-- 如果沒有評論，或正在編輯評論且評論內容為空，顯示評論表單 -->
              <div v-if="!currentReview || (isEditingReview && (!currentReview.comment || currentReview.comment.trim() === ''))" class="card bg-light">
                <div class="card-body">
                  <!-- 評分選擇 -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">評分</label>
                    <div class="rating-input d-flex justify-content-center gap-2">
                      <span
                        v-for="star in 5"
                        :key="star"
                        class="star-input fs-3"
                        :class="{ 'text-warning': star <= reviewForm.rating, 'text-muted': star > reviewForm.rating }"
                        @click="reviewForm.rating = star"
                        @mouseover="hoverRating = star"
                        @mouseleave="hoverRating = 0"
                        style="cursor: pointer; user-select: none;"
                      >
                        ★
                      </span>
                    </div>
                    <div class="text-center mt-2">
                      <span class="badge bg-warning text-dark">
                        {{ getRatingText(reviewForm.rating) }}
                      </span>
                    </div>
                  </div>

                  <!-- 評論內容 -->
                  <div class="mb-3">
                    <label class="form-label fw-bold">評論內容</label>
                    <textarea
                      v-model="reviewForm.comment"
                      class="form-control"
                      rows="5"
                      placeholder="請分享您的住宿體驗..."
                      maxlength="1000"
                    ></textarea>
                    <div class="form-text text-end">
                      {{ reviewForm.comment.length }}/1000
                    </div>
                  </div>

                  <!-- 提交按鈕 -->
                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-primary"
                      @click="submitReview"
                      :disabled="isSubmittingReview || !reviewForm.comment.trim()">
                      <i class="bi bi-check-lg"></i> 
                      {{ isSubmittingReview ? '送出中...' : '送出評論' }}
                    </button>
                    <button
                      class="btn btn-secondary"
                      @click="resetReviewForm"
                      :disabled="isSubmittingReview">
                      <i class="bi bi-arrow-counterclockwise"></i> 重設
                    </button>
                  </div>

                  <!-- 錯誤訊息 -->
                  <div v-if="reviewError" class="alert alert-danger mt-3 mb-0">
                    <i class="bi bi-exclamation-triangle"></i> {{ reviewError }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 溫馨提醒 -->
            <div class="alert alert-info alert-sm">
              <i class="bi bi-info-circle"></i> 
              <strong>提醒：</strong>
              <span v-if="selectedBooking.status === 1">請在入住前完成付款</span>
              <span v-else-if="selectedBooking.status === 2">請準時辦理入住手續</span>
              <span v-else-if="selectedBooking.status === 3">您的訂單已取消</span>
              <span v-else>感謝您的使用</span>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              v-if="selectedBooking.status === 1"
              type="button" 
              class="btn btn-success"
              @click="handlePayment(selectedBooking.id)">
              <i class="bi bi-credit-card"></i> 前往付款
            </button>
            
            <!-- 已完成(status=4)的訂單在 Modal 中直接顯示評論表單，不需要額外按鈕 -->
            
            <button 
              v-if="selectedBooking.can_cancel"
              type="button" 
              class="btn btn-danger"
              @click="showCancelModal(selectedBooking)">
              <i class="bi bi-x-circle"></i> 取消訂單
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="selectedBooking = null">
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 取消訂單 Modal -->
    <div 
      v-if="showingCancelModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      @click.self="closeCancelModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle"></i> 取消訂單
            </h5>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              @click="closeCancelModal">
            </button>
          </div>
          
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="bi bi-info-circle"></i> 
              <strong>注意：</strong>取消訂單後將無法恢復，請確認您的操作。
            </div>

            <div class="mb-3">
              <p><strong>訂單編號：</strong>#{{ bookingToCancel?.id }}</p>
              <p><strong>飯店名稱：</strong>{{ bookingToCancel?.hotel_name }}</p>
              <p><strong>入住日期：</strong>{{ formatDate(bookingToCancel?.start_date) }}</p>
              
              <div v-if="bookingToCancel?.days_until_checkin !== undefined" class="mt-3">
                <div class="alert alert-info py-2 px-2 small">
                  <i class="bi bi-calendar3"></i> 
                  距離入住還有 {{ bookingToCancel.days_until_checkin }} 天
                </div>
                
                <div v-if="bookingToCancel.cancellation_policy" class="cancellation-policy">
                  <p class="mb-2"><strong>退款政策：</strong></p>
                  <ul class="small mb-2">
                    <li>入住前 {{ bookingToCancel.cancellation_policy.free_cancellation_days }} 天：全額退款</li>
                    <li>入住前 {{ bookingToCancel.cancellation_policy.free_cancellation_days }} 天內：收取 {{ (bookingToCancel.cancellation_policy.penalty_rate * 100).toFixed(0) }}% 手續費</li>
                  </ul>
                  
                  <div class="alert alert-success py-2 px-2 small">
                    <i class="bi bi-cash-coin"></i> 
                    <strong>預估退款金額：</strong>
                    NT$ {{ calculateRefundAmount(bookingToCancel).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>取消原因：</strong></label>
              <select v-model="cancelReason" class="form-select" required>
                <option value="">請選擇取消原因</option>
                <option 
                  v-for="reason in cancelReasons" 
                  :key="reason.value"
                  :value="reason.value">
                  {{ reason.label }}
                </option>
              </select>
            </div>

            <div v-if="cancelReason === 'other'" class="mb-3">
              <label class="form-label"><strong>詳細說明：</strong></label>
              <textarea 
                v-model="cancelReasonDetail"
                class="form-control"
                rows="3"
                placeholder="請說明您的取消原因...">
              </textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeCancelModal"
              :disabled="isCancelling">
              返回
            </button>
            <button 
              type="button" 
              class="btn btn-danger"
              @click="confirmCancelBooking"
              :disabled="!cancelReason || isCancelling">
              <i class="bi bi-check-lg"></i> {{ isCancelling ? '處理中...' : '確認取消' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 背景遮罩 -->
    <div 
      v-if="selectedBooking || showingCancelModal" 
      class="modal-backdrop fade show">
    </div>
  </div>
</template>

<script>
// ✅ 修正：使用正式的 API 路徑
import { getBookings, getBookingById, cancelBooking, getCancelReasons, initiatePayment } from '@/user/api/order.js'
import { createReview } from '@/user/api/review.js'

// 後端 base URL（與 order.js 保持一致）
const API_BASE_URL = 'http://localhost:8080'

export default {
  name: 'BookingList',
  
  data() {
    return {
      allBookings: [], // 存儲所有訂單（未篩選）
      bookings: [], // 當前頁顯示的訂單
      selectedBooking: null,
      isLoading: false,
      currentPage: 0,
      pageSize: 9,
      totalPages: 0,
      totalElements: 0,
      currentStatus: '',
      
      // 取消訂單相關
      showingCancelModal: false,
      bookingToCancel: null,
      cancelReason: '',
      cancelReasonDetail: '',
      cancelReasons: getCancelReasons(),
      isCancelling: false,
      
      // 編輯特殊需求
      isEditingRequest: false,
      editedRequest: '',
      isSavingRequest: false,
      
      // 評論表單
      reviewForm: {
        rating: 5,
        comment: ''
      },
      currentReview: null, // 當前評論（如果有）
      isEditingReview: false, // 是否正在編輯評論
      hoverRating: 0,
      isSubmittingReview: false,
      reviewError: null
    }
  },
  
  mounted() {
    // ✅ 確保 userId 已保存到 localStorage
    this.ensureUserIdInLocalStorage()
    this.loadBookings()
  },
  
  methods: {
    /**
     * ✅ 確保 userId 已保存到 localStorage
     * 如果沒有，嘗試從 Pinia store 獲取並保存
     */
    ensureUserIdInLocalStorage() {
      let userId = localStorage.getItem('userId')
      if (!userId) {
        try {
          const piniaUserData = sessionStorage.getItem('hoUser')
          if (piniaUserData) {
            const parsed = JSON.parse(piniaUserData)
            if (parsed?.state?.userId) {
              userId = parsed.state.userId.toString()
              localStorage.setItem('userId', userId)
              console.log('✅ 從 Pinia store 恢復 userId 到 localStorage:', userId)
            } else if (parsed?.state?.id) {
              userId = parsed.state.id.toString()
              localStorage.setItem('userId', userId)
              console.log('✅ 從 Pinia store (id) 恢復 userId 到 localStorage:', userId)
            }
          }
        } catch (e) {
          console.warn('無法從 Pinia store 讀取 userId:', e)
        }
      } else {
        console.log('✅ userId 已存在於 localStorage:', userId)
      }
    },
    
    /**
     * ✅ 修正：載入訂單列表
     * 後端返回的是 List<CustomerBookingDTO>，不是分頁物件
     * 需要在前端進行狀態篩選
     */
    async loadBookings() {
      try {
        console.log('🔄 開始載入訂單列表...')
        this.isLoading = true
        
        // 後端不支援分頁和篩選參數，直接請求所有訂單
        const params = {}
        
        console.log('📤 請求參數:', params)
        const response = await getBookings(params)
        console.log('📥 收到回應:', response)
        
        // ✅ 修正：後端直接返回 List<CustomerBookingDTO>
        // response.data 就是訂單列表陣列
        let allBookings = response.data || []
        
        // 如果回應不是陣列，可能是錯誤訊息
        if (!Array.isArray(allBookings)) {
          console.error('❌ 回應格式錯誤，預期陣列但收到:', typeof allBookings)
          allBookings = []
        }
        
        console.log('📊 收到訂單數量:', allBookings.length)
        
        // 除錯：檢查第一筆訂單的資料結構
        if (allBookings.length > 0) {
          console.log('🔍 第一筆訂單原始資料:', allBookings[0])
          console.log('🔍 第一筆訂單的欄位:', Object.keys(allBookings[0]))
        }
        
        // ✅ 轉換後端資料格式為前端期望的格式
        // 後端返回: { bookingId, totalPrice, status, startDate, endDate, bookingDate, hotelName, photoUrl, hotelId }
        // 前端期望: { id, total_price, status, start_date, end_date, booking_date, night, hotel_name, hotel_image, ... }
        allBookings = allBookings.map(booking => {
          // 計算住宿天數
          let night = 0
          if (booking.startDate && booking.endDate) {
            const start = new Date(booking.startDate)
            const end = new Date(booking.endDate)
            night = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
          }
          
          // ✅ 支援多種可能的欄位名稱（camelCase 和 snake_case）
          const hotelName = booking.hotelName || booking.hotel_name || null
          const photoUrl = booking.photoUrl || booking.photo_url || booking.hotelImage || booking.hotel_image || null
          const hotelId = booking.hotelId || booking.hotel_id || null
          
          // 除錯：如果沒有飯店名稱或圖片，記錄詳細資訊
          if (!hotelName) {
            console.warn('⚠️ 訂單缺少飯店名稱:', {
              bookingId: booking.bookingId || booking.id,
              hotelId: hotelId,
              availableFields: Object.keys(booking),
              booking: booking
            })
          }
          if (!photoUrl) {
            console.warn('⚠️ 訂單缺少飯店圖片:', {
              bookingId: booking.bookingId || booking.id,
              hotelId: hotelId,
              availableFields: Object.keys(booking),
              booking: booking
            })
          }
          
          return {
            id: booking.bookingId,
            total_price: booking.totalPrice || 0,
            status: booking.status,
            start_date: booking.startDate,
            end_date: booking.endDate,
            booking_date: booking.bookingDate,
            night: night,
            // ✅ 後端現在提供飯店名稱和圖片（支援多種欄位名稱）
            hotel_name: hotelName || '飯店名稱',
            hotel_image: photoUrl || null,
            // ✅ 保存 hotelId，以便後續補齊資料
            hotel_id: hotelId || null,
            // ✅ 後端提供入住時間
            check_in_time: booking.checkInTime || '15:00',
          // ✅ 後端提供評論狀態
          can_review: booking.canReview === true || booking.canReview === 'true',
          has_review: booking.hasReview === true || booking.hasReview === 'true',
          // 初始化 has_review_with_content，如果 has_review 為 true，需要載入評論後才能確定是否有內容
          has_review_with_content: false,
          // ✅ 後端提供特殊需求/備註
          request: booking.request || null,
            payment_date: booking.payment_date || null,
            refund_status: booking.refund_status || null,
            refund_amount: booking.refund_amount || null,
            refund_progress: booking.refund_progress || 0,
            can_cancel: booking.can_cancel !== undefined ? booking.can_cancel : (booking.status === 1 || booking.status === 2)
          }
        })
        
        // 按訂單日期排序（最新的訂單在最前面）
        allBookings.sort((a, b) => {
          const dateA = new Date(a.booking_date || 0)
          const dateB = new Date(b.booking_date || 0)
          return dateB - dateA  // 降序排列
        })
        
        // 存儲所有訂單
        this.allBookings = allBookings
        
        // 應用篩選和分頁
        this.applyFilterAndPagination()
        
        console.log(`✅ 成功載入 ${this.allBookings.length} 筆訂單，顯示 ${this.bookings.length} 筆 (篩選: ${this.currentStatus || '全部'}, 頁碼: ${this.currentPage + 1})`)
        
      } catch (error) {
        console.error('❌ 載入訂單失敗:', error)
        
        // 詳細的錯誤訊息
        if (error.response) {
          console.error('伺服器回應錯誤:', {
            status: error.response.status,
            data: error.response.data
          })
          
          // 如果是 401，提示使用者登入
          if (error.response.status === 401) {
            alert('請先登入\n\n測試模式請在瀏覽器 Console 執行:\nfetch("http://localhost:8080/api/users/test/login?userId=1", {credentials: "include"})')
          } else {
            alert('載入訂單失敗: ' + (error.response.data?.message || error.response.data || '未知錯誤'))
          }
        } else if (error.request) {
          console.error('無法連接到伺服器')
          alert('無法連接到伺服器，請確認後端是否已啟動')
        } else {
          console.error('請求錯誤:', error.message)
          alert('載入訂單失敗: ' + error.message)
        }
        
        // 錯誤時清空資料
        this.allBookings = []
        this.bookings = []
        this.totalPages = 0
        this.totalElements = 0
        
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * ✅ 修正：查看訂單詳情
     * 後端直接返回 CustomerBookingDTO，不是 ApiResponse 包裝
     */
    async viewDetail(bookingId) {
      try {
        console.log('🔍 載入訂單詳情:', bookingId)
        
        const response = await getBookingById(bookingId)
        console.log('📥 訂單詳情回應:', response)
        
        // ✅ 修正：後端直接返回 CustomerBookingDTO
        // response.data 就是訂單物件
        // 需要轉換為前端期望的格式
        const booking = response.data
        
        // 計算住宿天數
        let night = 0
        if (booking.startDate && booking.endDate) {
          const start = new Date(booking.startDate)
          const end = new Date(booking.endDate)
          night = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        }
        
        // ✅ 轉換房型資訊格式（後端返回的是 RoomInfoDTO 列表）
        const rooms = (booking.rooms || []).map(room => ({
          room_name: room.roomName || '房型名稱',
          bed_type: room.bedType || '未設定',
          quantity: room.quantity || 0,
          price: room.unitPrice || 0,
          subtotal: room.subtotal || 0
        }))
        
        // 除錯：檢查訂單詳情的資料結構
        console.log('🔍 訂單詳情原始資料:', booking)
        console.log('🔍 訂單詳情的欄位:', Object.keys(booking))
        
        // ✅ 支援多種可能的欄位名稱（camelCase 和 snake_case）
        const hotelName = booking.hotelName || booking.hotel_name || null
        const photoUrl = booking.photoUrl || booking.photo_url || booking.hotelImage || booking.hotel_image || null
        
        // 除錯：如果沒有飯店名稱或圖片，記錄警告
        if (!hotelName) {
          console.warn('⚠️ 訂單詳情缺少飯店名稱:', booking.bookingId, booking)
        }
        if (!photoUrl) {
          console.warn('⚠️ 訂單詳情缺少飯店圖片:', booking.bookingId, booking)
        }
        
        // 轉換為前端期望的格式
        this.selectedBooking = {
          id: booking.bookingId,
          total_price: booking.totalPrice || 0,
          status: booking.status,
          start_date: booking.startDate,
          end_date: booking.endDate,
          booking_date: booking.bookingDate,
          night: night,
          // ✅ 後端現在提供飯店名稱和圖片（支援多種欄位名稱）
          hotel_name: hotelName || '飯店名稱',
          hotel_image: photoUrl || null,
          // ✅ 後端提供入住時間
          check_in_time: booking.checkInTime || booking.check_in_time || '15:00',
          // ✅ 後端提供房型資訊列表
          rooms: rooms,
          // ✅ 後端提供評論狀態
          // 處理布林值：true, false, null, undefined, "true", "false"
          can_review: booking.canReview === true || booking.canReview === 'true' || booking.canReview === 1,
          has_review: booking.hasReview === true || booking.hasReview === 'true' || booking.hasReview === 1,
          // 初始化 has_review_with_content，稍後載入評論時會更新
          has_review_with_content: false,
          // ✅ 後端提供特殊需求/備註
          request: booking.request || null,
          payment_date: booking.payment_date || null,
          updated_time: booking.updated_time || booking.bookingDate,
          cancelled_at: booking.cancelled_at || null,
          refund_status: booking.refund_status || null,
          refund_amount: booking.refund_amount || null,
          refund_progress: booking.refund_progress || 0,
          can_cancel: booking.can_cancel !== undefined ? booking.can_cancel : (booking.status === 1 || booking.status === 2)
        }
        
        console.log('✅ 成功載入訂單詳情')
        console.log('📊 訂單評論狀態:', {
          can_review: this.selectedBooking.can_review,
          has_review: this.selectedBooking.has_review,
          status: this.selectedBooking.status,
          canReview原始值: booking.canReview,
          hasReview原始值: booking.hasReview,
          canReview類型: typeof booking.canReview,
          hasReview類型: typeof booking.hasReview
        })
        
        // 如果有評論，載入評論內容；否則重設表單
        if (this.selectedBooking.has_review) {
          // 訂單已有評論，載入評論內容
          // 使用 try-catch 包裹，避免載入失敗時顯示錯誤
          try {
            await this.loadReviewForBooking(this.selectedBooking.id)
          } catch (error) {
            // 載入評論失敗時，不顯示錯誤訊息，只記錄到控制台
            console.warn('載入評論失敗，但不影響查看訂單詳情:', error)
            // 保持 currentReview 為 null，允許用戶嘗試送出評論
            this.currentReview = null
            this.isEditingReview = false
            this.resetReviewForm()
          }
        } else {
          // 沒有評論，重設評論表單
          this.currentReview = null
          this.isEditingReview = false
          this.resetReviewForm()
          
          // 確保 has_review_with_content 為 false
          const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking.id)
          if (bookingIndex !== -1) {
            this.allBookings[bookingIndex].has_review_with_content = false
          }
        }
        
      } catch (error) {
        console.error('❌ 載入訂單詳情失敗:', error)
        // 處理錯誤訊息（可能是字串或物件）
        let errorMessage = error.message
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else {
            errorMessage = error.response.data.message || error.response.data.error || errorMessage
          }
        }
        alert('載入訂單詳情失敗: ' + errorMessage)
      }
    },
    
    /**
     * 顯示取消訂單對話框
     */
    showCancelModal(booking) {
      this.bookingToCancel = booking
      this.showingCancelModal = true
      this.cancelReason = ''
      this.cancelReasonDetail = ''
    },
    
    /**
     * 關閉取消訂單對話框
     */
    closeCancelModal() {
      this.showingCancelModal = false
      this.bookingToCancel = null
      this.cancelReason = ''
      this.cancelReasonDetail = ''
    },
    
    /**
     * ✅ 修正：確認取消訂單
     * 1. method 改為 PUT
     * 2. 處理 ApiResponse 包裝
     * 3. 注意：目前後端不接收 cancel_reason，如需儲存原因需後端配合修改
     */
    async confirmCancelBooking() {
  if (!this.cancelReason) {
    alert('請選擇取消原因')
    return
  }

  if (!confirm('確定要取消此訂單嗎？\n\n此操作無法復原。')) {
    return
  }

  // ✅【關鍵：先存住 id，之後都用這個】
  const bookingId = this.bookingToCancel?.id

  if (!bookingId) {
    alert('訂單資料遺失，請重新操作')
    return
  }

  try {
    console.log('🔄 開始取消訂單:', bookingId)
    this.isCancelling = true

    const response = await cancelBooking(
      bookingId,
      this.cancelReason,
      this.cancelReasonDetail
    )

    console.log('📥 取消訂單回應:', response)

    alert(response.data.message || '訂單取消成功')
    console.log('✅ 訂單取消成功')

    // ✅ 現在這裡清掉也完全安全
    this.closeCancelModal()

    // ✅ 比對也只用 bookingId，不再碰 bookingToCancel
    if (this.selectedBooking?.id === bookingId) {
      this.selectedBooking = null
    }

    await this.loadBookings()

  } catch (error) {
    console.error('❌ 取消訂單失敗:', error)
    const errorMsg = error.response?.data?.message || error.message || '取消訂單失敗'
    alert('取消訂單失敗: ' + errorMsg)

  } finally {
    this.isCancelling = false
  }
},
    
    /**
     * 開始編輯特殊需求
     */
    startEditRequest() {
      this.isEditingRequest = true
      this.editedRequest = this.selectedBooking.request || ''
    },
    
    /**
     * 取消編輯特殊需求
     */
    cancelEditRequest() {
      this.isEditingRequest = false
      this.editedRequest = ''
    },
    
    /**
     * 儲存特殊需求
     * 注意：這個功能需要後端 API 支援 (目前可能沒有)
     */
    async saveRequest() {
      try {
        this.isSavingRequest = true
        
        // TODO: 這裡需要呼叫後端 API 來更新特殊需求
        // 目前暫時只更新前端狀態
        
        // const response = await updateBookingRequest(
        //   this.selectedBooking.id, 
        //   this.editedRequest
        // )
        
        // 暫時模擬更新
        this.selectedBooking.request = this.editedRequest
        this.isEditingRequest = false
        
        alert('特殊需求已更新')
        
      } catch (error) {
        console.error('更新特殊需求失敗:', error)
        alert('更新失敗: ' + (error.response?.data?.message || error.message))
        
      } finally {
        this.isSavingRequest = false
      }
    },
    
    /**
     * 取得飯店圖片
     */
    getHotelImage(booking) {
      if (booking.hotel_image) {
        // 如果 hotel_image 是完整 URL，直接返回
        if (booking.hotel_image.startsWith('http://') || booking.hotel_image.startsWith('https://')) {
          return booking.hotel_image
        }
        // 如果 hotel_image 是相對路徑（例如 /uploads/...），使用後端 API
        // 檢查是否已經包含 /api/photos/hotel 前綴
        if (booking.hotel_image.startsWith('/api/photos/hotel')) {
          return `${API_BASE_URL}${booking.hotel_image}`
        }
        // 如果是以 /uploads/ 開頭，直接拼接 baseURL
        if (booking.hotel_image.startsWith('/uploads/')) {
          return `${API_BASE_URL}${booking.hotel_image}`
        }
        // 否則使用 photoUrl 參數格式（適用於 static/images/ 下的圖片）
        return `${API_BASE_URL}/api/photos/hotel?photoUrl=${encodeURIComponent(booking.hotel_image)}`
      }
      // 預設圖片 - 使用後端 resources/static/images/no-image.jpg
      return `${API_BASE_URL}/images/no-image.jpg`
    },
    
    /**
     * 圖片載入錯誤時使用預設圖片
     */
    handleImageError(event) {
      // 使用後端的預設圖片
      event.target.src = `${API_BASE_URL}/images/no-image.jpg`
    },
    
    /**
     * ✅ 修正：處理付款
     * 1. 直接跳轉到付款頁面（後端返回 HTML）
     * 2. 後端已改為 GET method
     */
    /**
     * 發起付款 - 根據綠界官方文件實現
     * 參考：https://developers.ecpay.com.tw/?p=2856
     * 流程：
     * 1. 獲取支付參數（包含 CheckMacValue）
     * 2. 使用 HTML 表單 POST 到綠界 PaymentUrl
     * 3. 自動跳轉到綠界付款頁面
     */
    async handlePayment(bookingId) {
      if (!confirm('確定要前往付款頁面嗎?\n\n您將被導向到綠界金流的安全付款頁面。')) {
        return
      }
      
      try {
        console.log('💳 發起付款，訂單 ID:', bookingId)
        
        // 使用 AJAX 請求獲取支付參數（帶上認證信息）
        const response = await initiatePayment(bookingId)
        console.log('✅ 獲取支付參數成功:', response.data)
        
        // 後端應該返回 JSON 格式的支付參數
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('後端返回格式不正確，預期 JSON 物件')
        }
        
        const paymentParams = response.data
        
        // 根據綠界官方文件，PaymentUrl 是綠界的付款頁面 URL
        const paymentUrl = paymentParams.PaymentUrl
        if (!paymentUrl) {
          throw new Error('支付 URL 不存在，請檢查後端配置')
        }
        
        console.log('🔗 綠界付款 URL:', paymentUrl)
        console.log('📋 支付參數:', paymentParams)
        
        // 根據綠界官方文件，使用 HTML 表單 POST 方式提交到綠界
        // 創建隱藏的表單
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = paymentUrl
        form.style.display = 'none'
        form.target = '_self' // 在同一視窗打開
        
        // 添加所有支付參數（除了 PaymentUrl，因為它只是用於指定 action）
        // 根據綠界文件，需要傳遞的參數包括：
        // MerchantID, MerchantTradeNo, MerchantTradeDate, PaymentType, TotalAmount,
        // TradeDesc, ItemName, ReturnURL, ChoosePayment, EncryptType, CheckMacValue 等
        Object.keys(paymentParams).forEach(key => {
          // PaymentUrl 不需要作為表單欄位，它只是用於指定表單的 action
          if (key !== 'PaymentUrl') {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = paymentParams[key] || ''
            form.appendChild(input)
            console.log(`  ✓ ${key}: ${paymentParams[key]}`)
          }
        })
        
        // 將表單添加到頁面並自動提交
        document.body.appendChild(form)
        console.log('🚀 正在跳轉到綠界付款頁面...')
        form.submit()
        
        // 表單提交後，頁面會自動跳轉到綠界付款頁面
        
      } catch (error) {
        console.error('❌ 發起付款失敗:', error)
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        '未知錯誤'
        alert('發起付款失敗: ' + errorMsg)
      }
    },
    
    /**
     * 篩選訂單狀態
     */
    /**
     * 應用篩選和分頁（不重新請求 API）
     */
    applyFilterAndPagination() {
      // 先進行狀態篩選
      let filteredBookings = this.allBookings
      if (this.currentStatus !== '') {
        filteredBookings = this.allBookings.filter(booking => booking.status === this.currentStatus)
      }
      
      // 計算總數和總頁數
      this.totalElements = filteredBookings.length
      this.totalPages = Math.ceil(filteredBookings.length / this.pageSize)
      
      // 確保當前頁不超出範圍
      if (this.currentPage >= this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages - 1
      }
      
      // 進行分頁
      const start = this.currentPage * this.pageSize
      const end = start + this.pageSize
      this.bookings = filteredBookings.slice(start, end)
    },
    
    filterByStatus(status) {
      this.currentStatus = status
      this.currentPage = 0
      // 不需要重新請求，只需重新應用篩選和分頁
      this.applyFilterAndPagination()
    },
    
    /**
     * 切換頁面（不重新請求 API）
     */
    goToPage(page) {
      if (page < 0 || page >= this.totalPages) {
        return
      }
      this.currentPage = page
      this.applyFilterAndPagination()
      window.scrollTo(0, 0)
    },
    
    /**
     * 前往撰寫評論頁面（保留此方法以備用）
     */
    goToReview(bookingId) {
      this.$router.push(`/user/bookings/${bookingId}/review/create`)
    },
    
    /**
     * 查看評論
     */
    viewReview(bookingId) {
      this.$router.push(`/user/bookings/${bookingId}/review`)
    },
    
    /**
     * 取得評分文字
     */
    getRatingText(rating) {
      const texts = {
        1: '😞 非常不滿意',
        2: '😕 不太滿意',
        3: '😐 普通',
        4: '😊 滿意',
        5: '😍 非常滿意'
      }
      return texts[rating] || ''
    },
    
    /**
     * 重設評論表單
     * 如果有 currentReview，則切換到編輯模式（保留現有評論內容）
     * 如果沒有，則清空表單
     */
    resetReviewForm() {
      if (this.currentReview) {
        // 檢查評論是否有內容
        const hasComment = this.currentReview.comment && this.currentReview.comment.trim() !== ''
        
        if (hasComment) {
          // 如果評論已有內容，不允許編輯
          alert('評論已提交，無法再修改。')
          return
        }
        
        // 如果評論內容為空，切換到編輯模式
        this.reviewForm = {
          rating: this.currentReview.rating || 5,
          comment: this.currentReview.comment || ''
        }
        this.isEditingReview = true // 切換到編輯模式
      } else {
        // 沒有評論，清空表單
        this.reviewForm = {
          rating: 5,
          comment: ''
        }
        this.isEditingReview = false
      }
      this.hoverRating = 0
      this.reviewError = null
    },
    
    /**
     * 載入訂單的評論內容
     */
    async loadReviewForBooking(bookingId) {
      try {
        const { getReviewByBookingId } = await import('@/user/api/review.js')
        const response = await getReviewByBookingId(bookingId)
        
        console.log('📥 載入評論回應:', response)
        
        // 處理不同的回應格式
        let review = null
        if (response.data) {
          if (response.data.success && response.data.data) {
            review = response.data.data
          } else if (response.data.id || response.data.rating) {
            review = response.data
          }
        }
        
        if (review && review.id) {
          this.currentReview = review
          this.isEditingReview = false // 載入評論時，預設顯示評論內容（非編輯模式）
          
          // 檢查評論是否有內容（非NULL且非空字串）
          const hasComment = review.comment && review.comment.trim() !== ''
          
          // 更新訂單列表中的評論狀態（用於按鈕顯示）
          const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking?.id)
          if (bookingIndex !== -1) {
            this.allBookings[bookingIndex].has_review_with_content = hasComment
          }
          
          console.log('✅ 已載入評論內容，reviewId:', review.id, 'hasComment:', hasComment)
        } else {
          // 沒有評論，重設表單
          this.currentReview = null
          this.isEditingReview = false
          
          // 更新訂單列表中的評論狀態
          const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking?.id)
          if (bookingIndex !== -1) {
            this.allBookings[bookingIndex].has_review_with_content = false
          }
          
          this.resetReviewForm()
        }
      } catch (error) {
        console.error('❌ 載入評論失敗:', error)
        // 如果是 404，表示沒有評論，這是正常的
        if (error.response?.status === 404) {
          console.log('ℹ️ 此訂單尚未有評論')
          this.currentReview = null
          this.isEditingReview = false
          this.resetReviewForm()
        } else if (error.response?.status === 500) {
          // 500 錯誤可能是後端問題，但不代表沒有評論
          // 保持 currentReview 為 null，允許用戶嘗試送出評論
          // 如果後端返回「已有評論」，會在 submitReview 中處理
          console.log('ℹ️ 載入評論時發生 500 錯誤，將允許用戶嘗試送出評論')
          console.warn('載入評論失敗，但不影響用戶操作:', error.response?.data?.message || error.message)
          this.currentReview = null
          this.isEditingReview = false
          this.resetReviewForm()
          
          // 不顯示錯誤訊息給用戶，因為這可能是暫時的後端問題
          // 更新訂單列表中的評論狀態
          const bookingIndex = this.allBookings.findIndex(b => b.id === bookingId)
          if (bookingIndex !== -1) {
            // 如果 has_review 為 true，但載入失敗，保持 has_review_with_content 為 false
            // 這樣按鈕會顯示「我要評論」，用戶可以嘗試送出評論
            this.allBookings[bookingIndex].has_review_with_content = false
          }
        } else {
          // 其他錯誤，也重設表單
          console.error('載入評論時發生錯誤:', error)
          this.currentReview = null
          this.isEditingReview = false
          this.resetReviewForm()
          
          // 更新訂單列表中的評論狀態
          const bookingIndex = this.allBookings.findIndex(b => b.id === bookingId)
          if (bookingIndex !== -1) {
            this.allBookings[bookingIndex].has_review_with_content = false
          }
        }
      }
    },
    
    /**
     * 送出評論（創建或更新）
     */
    async submitReview() {
      if (!this.selectedBooking) {
        return
      }
      
      // 驗證評論內容
      const comment = this.reviewForm.comment.trim()
      if (!comment || comment.length === 0) {
        this.reviewError = '請輸入評論內容'
        alert('請輸入評論內容')
        return
      }
      
      // 驗證評分
      if (!this.reviewForm.rating || this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
        this.reviewError = '請選擇評分（1-5星）'
        alert('請選擇評分（1-5星）')
        return
      }
      
      try {
        this.isSubmittingReview = true
        this.reviewError = null
        
        // 獲取 userId，優先從 localStorage，其次從 Pinia store
        let userId = localStorage.getItem('userId')
        if (!userId) {
          try {
            const piniaUserData = sessionStorage.getItem('hoUser')
            if (piniaUserData) {
              const parsed = JSON.parse(piniaUserData)
              if (parsed?.state?.userId) {
                userId = parsed.state.userId.toString()
                localStorage.setItem('userId', userId)
              } else if (parsed?.state?.id) {
                userId = parsed.state.id.toString()
                localStorage.setItem('userId', userId)
              }
            }
          } catch (e) {
            console.warn('無法從 Pinia store 讀取 userId:', e)
          }
        }
        
        if (!userId) {
          this.reviewError = '請先登入'
          console.error('❌ 無法取得 userId，請確認已登入')
          return
        }
        
        console.log('✅ 取得 userId:', userId)
        
        const { createReview, updateReview } = await import('@/user/api/review.js')
        
        // 如果有現有評論，檢查是否可以更新
        if (this.currentReview && this.currentReview.id) {
          // 檢查評論是否已有內容（非空白）
          const hasComment = this.currentReview.comment && this.currentReview.comment.trim() !== ''
          
          if (hasComment) {
            // 如果評論已有內容，不允許再編輯
            alert('評論已提交，無法再修改。')
            this.isEditingReview = false
            return
          }
          
          // 如果評論為空，允許更新（填寫評論）
          console.log('🔄 更新評論（填寫空評論）:', {
            reviewId: this.currentReview.id,
            userId: userId,
            rating: this.reviewForm.rating,
            comment: this.reviewForm.comment
          })
          
          // 驗證評分和評論內容
          if (!this.reviewForm.rating || this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
            alert('請選擇評分（1-5星）')
            return
          }
          
          const comment = this.reviewForm.comment.trim()
          if (!comment || comment.length === 0) {
            alert('請輸入評論內容')
            return
          }
          
          const response = await updateReview(
            this.currentReview.id,
            Number(userId),
            {
              rating: Number(this.reviewForm.rating),
              comment: comment
            }
          )
          
          console.log('✅ 評論更新成功:', response)
          
          // 更新 currentReview
          if (response.data && response.data.data) {
            this.currentReview = response.data.data
          } else if (response.data && (response.data.id || response.data.rating)) {
            this.currentReview = response.data
          }
          this.isEditingReview = false // 更新成功後，切換到顯示模式
          
          // 更新訂單列表中的評論狀態
          const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking.id)
          if (bookingIndex !== -1) {
            const hasCommentAfterUpdate = this.currentReview.comment && this.currentReview.comment.trim() !== ''
            this.allBookings[bookingIndex].has_review_with_content = hasCommentAfterUpdate
            this.allBookings[bookingIndex].has_review = true
          }
          
          // 更新訂單詳情中的評論狀態
          if (this.selectedBooking) {
            this.selectedBooking.has_review = true
            const hasCommentAfterUpdate = this.currentReview.comment && this.currentReview.comment.trim() !== ''
            this.selectedBooking.has_review_with_content = hasCommentAfterUpdate
          }
          
          alert('評論送出成功！')
        } else {
          // 創建新評論前，先檢查是否已有評論內容
          // 如果 currentReview 存在且有內容，不允許創建
          if (this.currentReview && this.currentReview.comment && this.currentReview.comment.trim() !== '') {
            alert('此訂單已有評論，無法再創建新評論。')
            this.isEditingReview = false
            return
          }
          
          // 創建新評論
          console.log('🔄 創建評論:', {
            bookingId: this.selectedBooking.id,
            userId: userId,
            rating: this.reviewForm.rating,
            comment: this.reviewForm.comment
          })
          
          try {
            // 確保數據格式正確
            const comment = this.reviewForm.comment.trim()
            if (!comment || comment.length === 0) {
              alert('評論內容不能為空')
              return
            }
            
            const response = await createReview(
              Number(userId),
              this.selectedBooking.id,
              {
                rating: Number(this.reviewForm.rating),
                comment: comment
              }
            )
            
            console.log('✅ 評論創建成功:', response)
            
            // 保存新創建的評論
            if (response.data && response.data.data) {
              this.currentReview = response.data.data
            } else if (response.data && (response.data.id || response.data.rating)) {
              this.currentReview = response.data
            }
            this.isEditingReview = false // 創建成功後，切換到顯示模式
            
            // 更新訂單列表中的評論狀態
            const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking.id)
            if (bookingIndex !== -1) {
              const hasComment = this.currentReview.comment && this.currentReview.comment.trim() !== ''
              this.allBookings[bookingIndex].has_review_with_content = hasComment
              this.allBookings[bookingIndex].has_review = true
            }
            
            // 更新訂單詳情中的評論狀態
            if (this.selectedBooking) {
              this.selectedBooking.has_review = true
              const hasComment = this.currentReview.comment && this.currentReview.comment.trim() !== ''
              this.selectedBooking.has_review_with_content = hasComment
            }
            
            alert('評論送出成功！')
          } catch (createError) {
            // 如果創建失敗，檢查是否是因為已有評論
            const errorMessage = createError.response?.data?.message || createError.message || ''
            const errorStatus = createError.response?.status
            
            // 檢查是否是因為已有評論（包括內容為空的情況）
            if (errorMessage.includes('已有評論') || 
                errorMessage.includes('已有評論記錄') ||
                errorMessage.includes('already has a review') || 
                errorStatus === 400) {
              console.log('ℹ️ 檢測到已有評論或400錯誤，嘗試載入並更新評論...')
              
              // 載入現有評論
              try {
                const { getReviewByBookingId, updateReview } = await import('@/user/api/review.js')
                const reviewResponse = await getReviewByBookingId(this.selectedBooking.id)
                
                let review = null
                if (reviewResponse.data) {
                  if (reviewResponse.data.success && reviewResponse.data.data) {
                    review = reviewResponse.data.data
                  } else if (reviewResponse.data.id || reviewResponse.data.rating) {
                    review = reviewResponse.data
                  }
                }
                
                if (review && review.id) {
                  // 找到現有評論
                  this.currentReview = review
                  
                  // 檢查評論是否有內容
                  const hasComment = review.comment && review.comment.trim() !== ''
                  
                  if (hasComment) {
                    // 如果評論已有內容，顯示評論內容（不能編輯）
                    this.isEditingReview = false
                    console.log('✅ 已載入並顯示現有評論內容')
                    
                    // 更新訂單列表中的評論狀態
                    const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking.id)
                    if (bookingIndex !== -1) {
                      this.allBookings[bookingIndex].has_review_with_content = true
                      this.allBookings[bookingIndex].has_review = true
                    }
                    
                    alert('此訂單已有評論，無法再修改。')
                  } else {
                    // 如果評論為空，嘗試更新（使用用戶輸入的內容）
                    console.log('ℹ️ 評論為空，嘗試更新評論...')
                    
                    // 驗證評分和評論內容
                    if (!this.reviewForm.rating || this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
                      alert('請選擇評分（1-5星）')
                      this.isEditingReview = true
                      return
                    }
                    
                    const comment = this.reviewForm.comment.trim()
                    if (!comment || comment.length === 0) {
                      alert('請輸入評論內容')
                      this.isEditingReview = true
                      return
                    }
                    
                    // 更新評論
                    const updateResponse = await updateReview(
                      review.id,
                      Number(userId),
                      {
                        rating: Number(this.reviewForm.rating),
                        comment: comment
                      }
                    )
                    
                    console.log('✅ 評論更新成功:', updateResponse)
                    
                    // 更新 currentReview
                    if (updateResponse.data && updateResponse.data.data) {
                      this.currentReview = updateResponse.data.data
                    } else if (updateResponse.data && (updateResponse.data.id || updateResponse.data.rating)) {
                      this.currentReview = updateResponse.data
                    }
                    this.isEditingReview = false
                    
                    // 更新訂單列表中的評論狀態
                    const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking.id)
                    if (bookingIndex !== -1) {
                      this.allBookings[bookingIndex].has_review_with_content = true
                      this.allBookings[bookingIndex].has_review = true
                    }
                    
                    // 更新訂單詳情中的評論狀態
                    if (this.selectedBooking) {
                      this.selectedBooking.has_review = true
                      this.selectedBooking.has_review_with_content = true
                    }
                    
                    alert('評論送出成功！')
                  }
                } else {
                  // 找不到評論，顯示錯誤
                  console.error('無法載入評論內容')
                  const errorDetail = createError.response?.data?.message || errorMessage
                  alert('送出評論失敗: ' + (errorDetail || '無法載入評論內容，請稍後再試。'))
                }
              } catch (loadError) {
                console.error('❌ 載入或更新評論失敗:', loadError)
                const errorDetail = createError.response?.data?.message || errorMessage
                alert('送出評論失敗: ' + (errorDetail || '請檢查評論內容是否正確'))
              }
            } else {
              // 其他錯誤，直接拋出
              throw createError
            }
          }
        }
        
        // 送出評論成功後，更新訂單詳情中的評論狀態
        // 不重新載入整個訂單詳情，避免載入失敗時顯示錯誤
        if (this.selectedBooking) {
          this.selectedBooking.has_review = true
          const hasComment = this.currentReview && this.currentReview.comment && this.currentReview.comment.trim() !== ''
          this.selectedBooking.has_review_with_content = hasComment
        }
        
        // 重新載入訂單列表以更新按鈕狀態
        try {
          await this.loadBookings()
        } catch (error) {
          console.warn('重新載入訂單列表失敗，但不影響評論送出:', error)
          // 不顯示錯誤，因為評論已經成功送出
        }
        
      } catch (error) {
        console.error('❌ 送出評論失敗:', error)
        console.error('錯誤詳情:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        
        // 檢查是否是因為已有評論的錯誤
        const errorMessage = error.response?.data?.message || error.message || ''
        const errorStatus = error.response?.status
        
        if (errorMessage.includes('已有評論') || errorMessage.includes('already has a review') || errorStatus === 400) {
          // 如果創建失敗是因為已有評論或400錯誤，嘗試載入現有評論
          console.log('ℹ️ 檢測到已有評論或400錯誤，載入評論內容...')
          
          try {
            const { getReviewByBookingId } = await import('@/user/api/review.js')
            const reviewResponse = await getReviewByBookingId(this.selectedBooking.id)
            
            let review = null
            if (reviewResponse.data) {
              if (reviewResponse.data.success && reviewResponse.data.data) {
                review = reviewResponse.data.data
              } else if (reviewResponse.data.id || reviewResponse.data.rating) {
                review = reviewResponse.data
              }
            }
            
            if (review && review.id) {
              // 找到現有評論，顯示評論內容
              this.currentReview = review
              this.isEditingReview = false
              
              // 檢查評論是否有內容
              const hasComment = review.comment && review.comment.trim() !== ''
              
              // 更新訂單列表中的評論狀態
              const bookingIndex = this.allBookings.findIndex(b => b.id === this.selectedBooking.id)
              if (bookingIndex !== -1) {
                this.allBookings[bookingIndex].has_review_with_content = hasComment
                this.allBookings[bookingIndex].has_review = true
              }
              
              if (hasComment) {
                // 如果評論已有內容，顯示評論內容
                alert('此訂單已有評論，已為您載入評論內容。')
              } else {
                // 如果評論為空，允許填寫
                alert('此訂單已有評論記錄，但內容為空。您可以填寫評論內容。')
                this.isEditingReview = true
                this.reviewForm = {
                  rating: review.rating || 5,
                  comment: ''
                }
              }
            } else {
              // 找不到評論，顯示具體錯誤訊息
              const errorDetail = error.response?.data?.message || errorMessage
              this.reviewError = errorDetail || '無法載入評論內容，請稍後再試。'
              alert('送出評論失敗: ' + (errorDetail || '請檢查評論內容是否正確'))
            }
          } catch (loadError) {
            console.error('❌ 載入現有評論失敗:', loadError)
            // 如果載入評論也失敗，顯示原始錯誤
            const errorDetail = error.response?.data?.message || errorMessage
            this.reviewError = errorDetail || '送出評論失敗，請稍後再試。'
            alert('送出評論失敗: ' + (errorDetail || '請檢查評論內容是否正確'))
          }
        } else {
          // 其他錯誤
          const errorMsg = error.response?.data?.message || error.message || '送出評論失敗'
          this.reviewError = errorMsg
          alert('送出評論失敗: ' + errorMsg)
        }
      } finally {
        this.isSubmittingReview = false
      }
    },
    
    /**
     * 取得狀態樣式 class
     */
    getStatusClass(status) {
      switch(status) {
        case 1: return 'status-unpaid'
        case 2: return 'status-paid'
        case 3: return 'status-cancelled'
        case 4: return 'status-completed'
        default: return 'bg-secondary'
      }
    },
    
    /**
     * 取得狀態文字
     */
    getStatusText(status) {
      const statusMap = {
        1: '未付款',
        2: '已付款',
        3: '已取消',
        4: '已完成'
      }
      return statusMap[status] || '未知'
    },
    
    /**
     * 取得退款進度條樣式
     */
    getRefundProgressClass(status) {
      switch(status) {
        case 'processing': return 'bg-info'
        case 'completed': return 'bg-success'
        case 'failed': return 'bg-danger'
        default: return 'bg-secondary'
      }
    },
    
    /**
     * 取得取消原因的顯示文字
     */
    getCancelReasonLabel(value) {
      const reason = this.cancelReasons.find(r => r.value === value)
      return reason ? reason.label : value
    },
    
    /**
     * 計算退款金額
     */
    calculateRefundAmount(booking) {
      if (!booking || !booking.total_price) return 0
      
      const daysUntil = booking.days_until_checkin || 0
      const policy = booking.cancellation_policy
      
      if (!policy) return booking.total_price
      
      if (daysUntil > policy.free_cancellation_days) {
        return booking.total_price
      } else {
        return Math.floor(booking.total_price * (1 - policy.penalty_rate))
      }
    },
    
    /**
     * 格式化日期
     */
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    /**
     * 格式化時間
     * 處理 LocalTime 格式（如 "15:00:00" 或 "15:00"）
     */
    formatTime(timeStr) {
      if (!timeStr) return '15:00'  // 預設入住時間
      // 如果是字串，提取前 5 個字元（HH:mm）
      if (typeof timeStr === 'string') {
        return timeStr.substring(0, 5)
      }
      return '15:00'  // 預設值
    },
    
    /**
     * 格式化日期時間
     */
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '-'
      const date = new Date(dateTimeStr)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.container {
  background: transparent;
}

/* 卡片樣式 */
.booking-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.booking-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

/* 圖片容器 */
.card-img-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.booking-card:hover .card-img-top {
  transform: scale(1.05);
}

/* 狀態徽章在圖片上 */
.card-img-container .status-badge {
  top: 10px;
  right: 10px;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 簡化的訂單資訊 */
.booking-info-simple p {
  font-size: 0.95rem;
}

/* 詳細資訊樣式 */
.hotel-detail-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

/* 飯店詳細圖片 */
.hotel-image-section {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.hotel-detail-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

/* 特殊需求編輯區 */
.request-edit textarea {
  border: 2px solid #0d6efd;
  font-size: 0.9rem;
}

.request-edit textarea:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #0d6efd;
}

.request-edit textarea:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

/* 狀態徽章 */
.status-unpaid {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #842029;
}

.status-completed {
  background-color: #cfe2ff;
  color: #084298;
}

/* 退款資訊 */
.refund-info {
  background: #e7f3ff;
  padding: 10px;
  border-radius: 6px;
}

/* 篩選按鈕 */
.filter-btn {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

/* 載入動畫 */
.loading-spinner {
  text-align: center;
  padding: 3rem;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Modal 樣式 */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 溫馨提醒 */
.alert-sm {
  padding: 8px 12px;
  font-size: 0.875rem;
}

/* 區塊標題背景 */
.table-info td {
  background-color: #f8f9fa;
  font-weight: 600;
}

/* 確保表格有 tbody */
.table tbody tr {
  vertical-align: middle;
}

/* 查看評論按鈕（紫色） */
.btn-review-view {
  background-color: #6f42c1;
  border-color: #6f42c1;
  color: #fff;
}

.btn-review-view:hover {
  background-color: #5a32a3;
  border-color: #5a32a3;
  color: #fff;
}

.btn-review-view:focus {
  background-color: #5a32a3;
  border-color: #5a32a3;
  color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(111, 66, 193, 0.5);
}
</style>