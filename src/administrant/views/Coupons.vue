<template>
  <div>
    <!-- 頁面標題 -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <component :is="TicketIcon" class="w-8 h-8 text-foreground" />
        <h1 class="text-3xl font-bold text-foreground">優惠券</h1>
      </div>
      <p class="text-muted-foreground">管理平台優惠券和促銷活動</p>
    </div>

    <!-- 統計概覽 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <StatCard
        title="進行中優惠券"
        :value="ongoingCouponsCount"
        :icon="TicketIcon"
        iconColor="primary"
      />
      <StatCard
        title="已使用優惠次數"
        :value="totalUseCount"
        :icon="TicketIcon"
        iconColor="success"
      />
      <StatCard
        title="優惠券發放"
        :value="totalTakeCount"
        :icon="TicketIcon"
        iconColor="info"
      />
    </div>

    <!-- 分隔線 -->
    <div class="mb-8">
      <div class="flex items-center gap-4">
        <div class="flex-1 border-t border-border"></div>
        <h2 class="text-xl font-bold text-foreground px-4">優惠券管理</h2>
        <div class="flex-1 border-t border-border"></div>
      </div>
    </div>

    <!-- 優惠券列表 -->
    <div class="bg-card rounded-lg border border-border p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-foreground">優惠券列表</h2>
        <button 
          @click="handleCreate"
          class="px-5 py-2.5 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-all whitespace-nowrap font-semibold shadow-md hover:shadow-lg active:shadow-sm border-2 border-orange-300/50 hover:border-orange-200 flex items-center gap-2"
        >
          <component :is="PlusIcon" class="w-5 h-5" />
          <span>新增優惠券</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border ho-table-header">
              <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">ID</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">優惠券名稱</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">代碼</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">最低消費</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">折扣值</th>
              <th 
                class="px-4 py-3 text-center text-sm font-semibold text-foreground cursor-pointer hover:opacity-80 transition-colors"
                @click="handleSort('useCount')"
              >
                <div class="flex items-center justify-center gap-2">
                  <span>已使用/可使用次數</span>
                  <component 
                    :is="getSortIcon('useCount')" 
                    :class="getSortIconClass('useCount')"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-foreground">
                <span>有效期間</span>
              </th>
              <th 
                class="pl-2 pr-4 py-3 text-center text-sm font-semibold text-foreground cursor-pointer hover:opacity-80 transition-colors"
                @click="handleSort('valid')"
              >
                <div class="flex items-center justify-center gap-2">
                  <span>狀態</span>
                  <component 
                    :is="getSortIcon('valid')" 
                    :class="getSortIconClass('valid')"
                  />
                </div>
              </th>
              <th 
                class="pl-4 pr-2 py-3 text-left text-sm font-semibold text-foreground w-32 cursor-pointer hover:opacity-80 transition-colors"
                @click="handleSort('createTime')"
              >
                <div class="flex items-center gap-2">
                  <span>建立時間</span>
                  <component 
                    :is="getSortIcon('createTime')" 
                    :class="getSortIconClass('createTime')"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="px-4 py-8 text-center text-muted-foreground">
                載入中...
              </td>
            </tr>
            <tr v-else-if="coupons.length === 0">
              <td colspan="10" class="px-4 py-8 text-center text-muted-foreground">
                暫無優惠券資料
              </td>
            </tr>
            <tr
              v-else
              v-for="coupon in paginatedCoupons"
              :key="coupon.id"
              class="border-b border-border ho-table-row transition-colors"
            >
              <td class="px-4 py-4 text-muted-foreground font-mono text-sm">{{ coupon.id || '-' }}</td>
              <td class="px-4 py-4 text-foreground">{{ coupon.name || '-' }}</td>
              <td class="px-4 py-4 text-foreground font-mono text-sm">{{ coupon.sn || '-' }}</td>
              <td class="px-4 py-4 text-muted-foreground">
                {{ coupon.minimum ? `$${coupon.minimum.toLocaleString()}` : '-' }}
              </td>
              <td class="px-4 py-4 text-foreground font-semibold">
                {{ coupon.discount ? `$${coupon.discount.toLocaleString()}` : '-' }}
              </td>
              <td class="px-4 py-4 text-center text-muted-foreground">
                {{ coupon.useCount || 0 }} / {{ coupon.takeCount || 0 }}
              </td>
              <td class="px-4 py-4 text-center text-muted-foreground text-sm">
                <div v-if="coupon.startTime || coupon.endTime">
                  <div>{{ formatDate(coupon.startTime) }}</div>
                  <div class="text-xs text-muted-foreground">~ {{ formatDate(coupon.endTime) }}</div>
                </div>
                <span v-else>-</span>
              </td>
              <td class="pl-2 pr-4 py-4 text-center">
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(coupon)"
                >
                  {{ getStatusLabel(coupon) }}
                </span>
              </td>
              <td class="pl-4 pr-2 py-4 text-muted-foreground text-sm w-32">
                {{ formatDateTime(coupon.createTime) }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button 
                    @click="handleEdit(coupon.id)"
                    class="px-4 py-2 text-sm font-semibold border-2 border-primary/80 text-primary bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-primary"
                  >
                    編輯
                  </button>
                  <button
                    v-if="coupon.valid === 1 || coupon.valid === true"
                    @click="handleDisable(coupon.id)"
                    class="px-4 py-2 text-sm font-semibold border-2 border-orange-600/80 text-orange-600 bg-background hover:bg-orange-600 hover:text-white rounded-lg transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isDisabling"
                  >
                    停用
                  </button>
                  <button
                    @click="handleDelete(coupon.id)"
                    class="px-4 py-2 text-sm font-semibold border-2 border-red-600/80 text-red-600 bg-background hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isDeleting"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制 -->
      <div v-if="!loading && coupons.length > 0" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          顯示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }} 筆，共 {{ totalItems }} 筆
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一頁
          </button>
          <div class="flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 border rounded-lg transition-colors',
                page === currentPage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>

    <!-- 新增優惠券對話框 -->
    <div 
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeCreateModal"
    >
      <div 
        class="rounded-lg border border-border p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        @click.stop
        style="background-color: var(--color-card); overflow-x: hidden;"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold text-foreground">新增優惠券</h2>
          <button 
            @click="closeCreateModal"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-xs text-muted-foreground mb-4">
          <span class="text-red-500">*</span>為必填欄位
        </p>

        <form @submit.prevent="submitCreateForm" class="space-y-3">
          <!-- 優惠券名稱 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              優惠券名稱 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="createForm.name"
              type="text"
              required
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入優惠券名稱"
            />
          </div>

          <!-- 代碼 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              代碼 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="createForm.sn"
              type="text"
              required
              @input="createForm.sn = createForm.sn.toUpperCase()"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入優惠券代碼"
            />
          </div>

          <!-- 最低消費 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              最低消費
            </label>
            <input
              v-model.number="createForm.minimum"
              type="number"
              min="0"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入最低消費金額"
            />
          </div>

          <!-- 折扣值 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              折扣值 <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="createForm.discount"
              type="number"
              required
              min="0"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入折扣金額"
            />
          </div>

          <!-- 可使用次數 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              可使用次數
            </label>
            <input
              v-model.number="createForm.takeCount"
              type="number"
              min="0"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入可使用次數（預設為 0）"
            />
          </div>

          <!-- 有效期限 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              有效期限
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-muted-foreground mb-1">
                  開始時間 <span class="text-red-500">*</span>
                </label>
                <DateTimePicker
                  v-model="createForm.startDateTime"
                  :required="true"
                  placeholder="請選擇開始時間"
                  picker-id="start-datetime"
                />
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1">
                  結束時間 <span class="text-xs text-muted-foreground">（不填為長期有效）</span>
                </label>
                <DateTimePicker
                  v-model="createForm.endDateTime"
                  :required="false"
                  placeholder="請選擇結束時間（選填）"
                  :min="createForm.startDateTime"
                  picker-id="end-datetime"
                />
              </div>
            </div>
          </div>

          <!-- 按鈕 -->
          <div class="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-1.5 border-2 border-border rounded-lg bg-background text-foreground hover:bg-muted transition-all shadow-md hover:shadow-lg active:shadow-sm text-sm font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-md hover:shadow-lg active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              {{ isSubmitting ? '建立中...' : '建立' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  <!-- 編輯優惠券 Modal -->
  <div
    v-if="showEditModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="closeEditModal"
  >
    <div 
      class="rounded-lg border border-border p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
      @click.stop
      style="background-color: var(--color-card); overflow-x: hidden;"
    >
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-bold text-foreground">編輯優惠券</h2>
        <button 
          @click="closeEditModal"
          class="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p class="text-xs text-muted-foreground mb-4">
        <span class="text-red-500">*</span>為必填欄位
      </p>

      <form @submit.prevent="submitEditForm" class="space-y-3">
          <!-- 優惠券名稱 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              優惠券名稱 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editForm.name"
              type="text"
              required
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入優惠券名稱"
            />
          </div>

          <!-- 代碼 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              代碼 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editForm.sn"
              type="text"
              required
              @input="editForm.sn = editForm.sn.toUpperCase()"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入優惠券代碼"
            />
          </div>

          <!-- 最低消費 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              最低消費
            </label>
            <input
              v-model.number="editForm.minimum"
              type="number"
              min="0"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入最低消費金額"
            />
          </div>

          <!-- 折扣值 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              折扣值 <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="editForm.discount"
              type="number"
              required
              min="0"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入折扣金額"
            />
          </div>

          <!-- 可使用次數 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              可使用次數
            </label>
            <input
              v-model.number="editForm.takeCount"
              type="number"
              min="0"
              class="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="請輸入可使用次數"
            />
          </div>

          <!-- 有效期限 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              有效期限
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-muted-foreground mb-1">
                  開始時間 <span class="text-red-500">*</span>
                </label>
                <DateTimePicker
                  v-model="editForm.startDateTime"
                  :required="true"
                  placeholder="請選擇開始時間"
                  picker-id="edit-start-datetime"
                />
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1">
                  結束時間 <span class="text-xs text-muted-foreground">（不填為長期有效）</span>
                </label>
                <DateTimePicker
                  v-model="editForm.endDateTime"
                  :required="false"
                  :min="editForm.startDateTime"
                  placeholder="請選擇結束時間（選填）"
                  picker-id="edit-end-datetime"
                />
              </div>
            </div>
          </div>

          <!-- 狀態控制 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              優惠券狀態
            </label>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  :value="1"
                  v-model="editForm.valid"
                  class="w-4 h-4 text-primary focus:ring-primary"
                />
                <span class="text-foreground text-sm">啟用</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  :value="0"
                  v-model="editForm.valid"
                  class="w-4 h-4 text-primary focus:ring-primary"
                />
                <span class="text-foreground text-sm">停用</span>
              </label>
            </div>
            <p v-if="editForm.valid === 0 || editForm.valid === false" class="text-xs text-muted-foreground mt-1.5">
              提示：若要重新啟用，請確保優惠券內容符合進行中的原則（未過期、未用完、有效期間正確等）
            </p>
          </div>

          <!-- 按鈕 -->
          <div class="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              @click="closeEditModal"
              class="px-4 py-1.5 border-2 border-border rounded-lg bg-background text-foreground hover:bg-muted transition-all shadow-md hover:shadow-lg active:shadow-sm text-sm font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isUpdating"
              class="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-md hover:shadow-lg active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              {{ isUpdating ? '更新中...' : '更新' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import StatCard from '@/administrant/components/StatCard.vue'
import DateTimePicker from '@/administrant/components/DateTimePicker.vue'
import { TicketIcon, CurrencyYenIcon, ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon, PlusIcon } from '@/administrant/components/icons'
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/administrant/api/coupons'

// 管理多個日期時間選擇器的打開狀態
const pickerRefs = ref({})
const pickerManager = {
  register(pickerId, pickerInstance) {
    pickerRefs.value[pickerId] = pickerInstance
  },
  unregister(pickerId) {
    delete pickerRefs.value[pickerId]
  },
  closeAll(exceptPickerId) {
    Object.keys(pickerRefs.value).forEach(id => {
      if (id !== exceptPickerId && pickerRefs.value[id]) {
        pickerRefs.value[id].closePicker()
      }
    })
  }
}

provide('pickerManager', pickerManager)

const coupons = ref([])
const loading = ref(false)
const sortField = ref('createTime') // 當前排序欄位：'useCount', 'endTime', 'valid', 'createTime'，默認按建立時間排序
const sortDirection = ref('desc') // 'asc' 或 'desc'，默認降序（最新的在前）
const currentPage = ref(1) // 當前頁碼
const pageSize = ref(10) // 每頁顯示數量

// 新增優惠券表單
const showCreateModal = ref(false)
const isSubmitting = ref(false)
const showEditModal = ref(false)
const isUpdating = ref(false)
const editingCouponId = ref(null)
const isDisabling = ref(false)
const isDeleting = ref(false)
const createForm = ref({
  name: '',
  sn: '',
  minimum: null,
  discount: null,
  useCount: 0,
  takeCount: 0,
  startDateTime: '',
  endDateTime: ''
})
const editForm = ref({
  name: '',
  sn: '',
  minimum: null,
  discount: null,
  takeCount: 0,
  startDateTime: '',
  endDateTime: '',
  valid: null
})


// 獲取狀態標籤
const getStatusLabel = (coupon) => {
  // TODO: 待整合 booking 模組後，useCount 應從後端自動計算
  // 計算邏輯：統計 booking table 中 status=2(已付款) 或 status=4(完成) 且 coupon_id 不為 null 的訂單數量
  // 對應到該 coupon 的 id，該 coupon 的 use_count 應等於符合條件的訂單數量
  
  // 檢查是否無效：可使用次數為 0
  if (coupon.takeCount === 0 || coupon.takeCount === null || coupon.takeCount === undefined) {
    return '無效'
  }
  
  // 檢查是否已用完：已使用次數 >= 可使用次數 且 可使用次數 > 0
  if (coupon.takeCount > 0 && coupon.useCount >= coupon.takeCount) {
    return '已用完'
  }
  
  // 檢查時間範圍
  const now = new Date()
  const startTime = coupon.startTime ? new Date(coupon.startTime) : null
  const endTime = coupon.endTime ? new Date(coupon.endTime) : null
  
  // 如果設定了結束時間且當前時間已超過結束時間
  if (endTime && now > endTime) {
    return '已過期'
  }
  
  // 如果設定了開始時間且當前時間尚未到達開始時間
  if (startTime && now < startTime) {
    return '未開始'
  }
  
  // 如果 valid = 1 且上述條件都不滿足，則為進行中
  if (coupon.valid === 1 || coupon.valid === true) {
    return '進行中'
  }
  
  return '已結束'
}

// 獲取狀態 Badge 樣式
const getStatusClass = (coupon) => {
  // 檢查是否無效：可使用次數為 0
  if (coupon.takeCount === 0 || coupon.takeCount === null || coupon.takeCount === undefined) {
    return 'bg-gray-100 text-gray-600'
  }
  
  // 檢查是否已用完
  if (coupon.takeCount > 0 && coupon.useCount >= coupon.takeCount) {
    return 'bg-orange-100 text-orange-700'
  }
  
  // 檢查時間範圍
  const now = new Date()
  const startTime = coupon.startTime ? new Date(coupon.startTime) : null
  const endTime = coupon.endTime ? new Date(coupon.endTime) : null
  
  // 如果設定了結束時間且當前時間已超過結束時間
  if (endTime && now > endTime) {
    return 'bg-gray-100 text-gray-600'
  }
  
  // 如果設定了開始時間且當前時間尚未到達開始時間
  if (startTime && now < startTime) {
    return 'bg-blue-100 text-blue-700'
  }
  
  // 如果 valid = 1 且上述條件都不滿足，則為進行中
  if (coupon.valid === 1 || coupon.valid === true) {
    return 'bg-green-100 text-green-700'
  }
  
  return 'bg-gray-100 text-gray-600'
}

// 格式化日期（僅日期）
const formatDate = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化日期時間
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 計算進行中優惠券數量
const ongoingCouponsCount = computed(() => {
  return coupons.value.filter(coupon => getStatusLabel(coupon) === '進行中').length
})

// 計算所有優惠券的已使用次數總和
const totalUseCount = computed(() => {
  return coupons.value.reduce((sum, coupon) => {
    return sum + (coupon.useCount || 0)
  }, 0)
})

// 計算所有優惠券的發放次數總和（take_count）
const totalTakeCount = computed(() => {
  return coupons.value.reduce((sum, coupon) => {
    return sum + (coupon.takeCount || 0)
  }, 0)
})

// 獲取優惠券列表
const fetchCoupons = async () => {
  loading.value = true
  try {
    const data = await getAllCoupons()
    coupons.value = Array.isArray(data) ? data : []
    console.log('優惠券列表:', coupons.value)
    // 重置到第一頁
    currentPage.value = 1
  } catch (error) {
    console.error('獲取優惠券列表失敗:', error)
    coupons.value = []
  } finally {
    loading.value = false
  }
}

// 排序處理
const handleSort = (field) => {
  if (sortField.value === field) {
    // 如果點擊同一個欄位
    if (field === 'createTime') {
      // 建立時間欄位：如果當前是升序，第二次點擊恢復預設排序（降序，最新的在前）
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc'
      } else {
        // 如果當前是降序，切換為升序（最早的在最前面）
        sortDirection.value = 'asc'
      }
    } else if (field === 'useCount') {
      // 已使用/可使用次數欄位：切換排序方向
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc'
      } else {
        sortDirection.value = 'asc'
      }
    } else {
      // 其他欄位：第二次點擊恢復默認排序（按建立時間降序）
      sortField.value = 'createTime'
      sortDirection.value = 'desc'
    }
  } else {
    // 如果點擊不同欄位，設置新的排序欄位和方向
    sortField.value = field
    if (field === 'createTime') {
      // 建立時間欄位：預設是降序（最新的在前）
      sortDirection.value = 'desc'
    } else {
      // 其他欄位：預設是升序
      sortDirection.value = 'asc'
    }
  }
  // 排序後重置到第一頁
  currentPage.value = 1
}

// 獲取排序圖標
const getSortIcon = (field) => {
  if (sortField.value !== field) {
    return ArrowsUpDownIcon
  }
  return sortDirection.value === 'asc' ? ArrowUpIcon : ArrowDownIcon
}

// 獲取排序圖標樣式
const getSortIconClass = (field) => {
  if (sortField.value === field) {
    return 'text-primary'
  }
  return 'text-gray-400'
}

// 排序後的優惠券列表
const sortedCoupons = computed(() => {
  if (!sortField.value) {
    return coupons.value
  }

  const sorted = [...coupons.value]

  sorted.sort((a, b) => {
    let aValue, bValue

    switch (sortField.value) {
      case 'useCount':
        // 按可使用次數排序
        // 確保正確處理 null、undefined 和 0 的情況
        aValue = a.takeCount !== null && a.takeCount !== undefined ? a.takeCount : 0
        bValue = b.takeCount !== null && b.takeCount !== undefined ? b.takeCount : 0
        break
      case 'endTime':
        // 按有效期限（結束時間）排序
        aValue = a.endTime ? new Date(a.endTime).getTime() : 0
        bValue = b.endTime ? new Date(b.endTime).getTime() : 0
        break
      case 'valid':
        // 按狀態排序（進行中排在最前面 > 未開始 > 其他狀態）
        const aStatus = getStatusLabel(a)
        const bStatus = getStatusLabel(b)
        
        // 如果其中一個是「進行中」，優先排序（無論升序降序，進行中都在最前面）
        if (aStatus === '進行中' && bStatus !== '進行中') {
          return -1 // a 排在前面
        }
        if (bStatus === '進行中' && aStatus !== '進行中') {
          return 1 // b 排在前面
        }
        
        // 如果都是「進行中」，保持原順序
        if (aStatus === '進行中' && bStatus === '進行中') {
          return 0
        }
        
        // 如果其中一個是「未開始」，排在非「進行中」狀態的前面
        if (aStatus === '未開始' && bStatus !== '進行中' && bStatus !== '未開始') {
          return -1 // a 排在前面
        }
        if (bStatus === '未開始' && aStatus !== '進行中' && aStatus !== '未開始') {
          return 1 // b 排在前面
        }
        
        // 如果都是「未開始」，保持原順序
        if (aStatus === '未開始' && bStatus === '未開始') {
          return 0
        }
        
        // 其他狀態按字母順序排序
        if (aStatus < bStatus) {
          return sortDirection.value === 'asc' ? -1 : 1
        }
        if (aStatus > bStatus) {
          return sortDirection.value === 'asc' ? 1 : -1
        }
        return 0
      case 'createTime':
        // 按建立時間排序，如果建立時間相同則按ID降序排序
        aValue = a.createTime ? new Date(a.createTime).getTime() : 0
        bValue = b.createTime ? new Date(b.createTime).getTime() : 0
        
        // 如果建立時間相同，按ID降序排序
        if (aValue === bValue) {
          const aId = a.id || 0
          const bId = b.id || 0
          return bId - aId // 降序：ID大的在前
        }
        break
      default:
        return 0
    }

    if (aValue < bValue) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection.value === 'asc' ? 1 : -1
    }
    return 0
  })

  return sorted
})

// 分頁相關計算
const totalItems = computed(() => sortedCoupons.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

// 分頁後的優惠券列表
const paginatedCoupons = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedCoupons.value.slice(start, end)
})

// 可見的頁碼（最多顯示5個）
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  // 如果接近末尾，調整起始位置
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 跳轉到指定頁
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滾動到表格頂部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 打開新增優惠券對話框
const handleCreate = () => {
  // 重置表單
  createForm.value = {
    name: '',
    sn: '',
    minimum: null,
    discount: null,
    useCount: 0,
    takeCount: 0,
    startDateTime: '',
    endDateTime: ''
  }
  showCreateModal.value = true
}

// 關閉新增優惠券對話框
const closeCreateModal = () => {
  showCreateModal.value = false
  // 重置表單
  createForm.value = {
    name: '',
    sn: '',
    minimum: null,
    discount: null,
    useCount: 0,
    takeCount: 0,
    startDateTime: '',
    endDateTime: ''
  }
}

// 提交新增優惠券表單
const submitCreateForm = async () => {
  isSubmitting.value = true
  try {
    // 準備提交數據
    const formData = {
      name: createForm.value.name.trim(),
      sn: createForm.value.sn.trim().toUpperCase(),
      minimum: createForm.value.minimum || null,
      discount: createForm.value.discount,
      useCount: createForm.value.useCount || 0,
      takeCount: createForm.value.takeCount || 0,
      startTime: createForm.value.startDateTime || null,
      endTime: createForm.value.endDateTime || null, // 結束時間為空時設為 null（長期有效）
      valid: 1 // 預設為有效
    }

    console.log('提交表單數據:', formData)
    
    // 調用 API 創建優惠券
    await createCoupon(formData)
    
    // 關閉對話框
    closeCreateModal()
    
    // 重新獲取優惠券列表
    await fetchCoupons()
    
    // 顯示成功訊息（可以替換為 toast 通知）
    alert('優惠券建立成功！')
  } catch (error) {
    console.error('建立優惠券失敗:', error)
    // 顯示錯誤訊息（可以替換為 toast 通知）
    alert(error.response?.data?.error || error.message || '建立優惠券失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 編輯優惠券
const handleEdit = (id) => {
  const target = coupons.value.find(item => item.id === id)
  if (!target) return

  editingCouponId.value = id
  // 確保 valid 值轉換為數字類型（0 或 1）
  const validValue = target.valid === 1 || target.valid === true ? 1 : 
                     (target.valid === 0 || target.valid === false ? 0 : null)
  
  editForm.value = {
    name: target.name || '',
    sn: target.sn || '',
    minimum: target.minimum ?? null,
    discount: target.discount ?? null,
    takeCount: target.takeCount ?? 0,
    startDateTime: target.startTime ? new Date(target.startTime).toISOString() : '',
    endDateTime: target.endTime ? new Date(target.endTime).toISOString() : '',
    valid: validValue
  }

  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCouponId.value = null
  editForm.value = {
    name: '',
    sn: '',
    minimum: null,
    discount: null,
    takeCount: 0,
    startDateTime: '',
    endDateTime: '',
    valid: null
  }
}

// 檢查是否符合進行中的條件
const checkOngoingConditions = (coupon) => {
  // 檢查可使用次數不能為 0
  if (coupon.takeCount === 0 || coupon.takeCount === null || coupon.takeCount === undefined) {
    return { valid: false, message: '無法啟用：可使用次數不能為 0' }
  }
  
  // 檢查是否已用完：已使用次數 >= 可使用次數 且 可使用次數 > 0
  if (coupon.takeCount > 0 && coupon.useCount >= coupon.takeCount) {
    return { valid: false, message: '無法啟用：優惠券已用完' }
  }
  
  // 檢查時間範圍
  const now = new Date()
  const endTime = coupon.endDateTime ? new Date(coupon.endDateTime) : null
  
  // 如果設定了結束時間且當前時間已超過結束時間
  if (endTime && now > endTime) {
    return { valid: false, message: '無法啟用：優惠券已過期' }
  }
  
  // 注意：開始時間在未來是允許的，優惠券可以提前啟用，只是狀態會顯示「未開始」
  // 因此不在此處檢查開始時間是否在未來
  
  return { valid: true, message: '' }
}

// 停用優惠券
const handleDisable = async (id) => {
  if (!confirm('確定要停用此優惠券嗎？')) {
    return
  }
  
  isDisabling.value = true
  try {
    const payload = {
      valid: 0
    }
    await updateCoupon(id, payload)
    await fetchCoupons()
    alert('優惠券已停用')
  } catch (error) {
    console.error('停用優惠券失敗:', error)
    alert(error.response?.data?.error || error.message || '停用優惠券失敗，請稍後再試')
  } finally {
    isDisabling.value = false
  }
}

// 刪除優惠券
const handleDelete = async (id) => {
  if (!confirm('確定要刪除此優惠券嗎？此操作無法復原。')) {
    return
  }
  
  isDeleting.value = true
  try {
    await deleteCoupon(id)
    await fetchCoupons()
    alert('優惠券已刪除')
  } catch (error) {
    console.error('刪除優惠券失敗:', error)
    alert(error.response?.data?.error || error.message || '刪除優惠券失敗，請稍後再試')
  } finally {
    isDeleting.value = false
  }
}

const submitEditForm = async () => {
  if (!editingCouponId.value) return
  
  // 獲取原始優惠券資料
  const originalCoupon = coupons.value.find(item => item.id === editingCouponId.value)
  if (!originalCoupon) return
  
  // 確定 valid 值（如果表單中沒有設定，保持原值）
  const newValid = editForm.value.valid !== null && editForm.value.valid !== undefined 
    ? (editForm.value.valid === 1 || editForm.value.valid === true ? 1 : 0)
    : (originalCoupon.valid === 1 || originalCoupon.valid === true ? 1 : 0)
  
  // 如果嘗試從停用狀態（valid=0）改為啟用狀態（valid=1），需要檢查是否符合進行中條件
  const originalValid = originalCoupon.valid === 1 || originalCoupon.valid === true ? 1 : 0
  const isReEnabling = originalValid === 0 && newValid === 1
  
  if (isReEnabling) {
    // 檢查是否符合進行中的條件
    const checkResult = checkOngoingConditions({
      useCount: originalCoupon?.useCount || 0,
      takeCount: editForm.value.takeCount || 0,
      startDateTime: editForm.value.startDateTime,
      endDateTime: editForm.value.endDateTime
    })
    
    if (!checkResult.valid) {
      alert(checkResult.message)
      return
    }
  }
  
  isUpdating.value = true
  try {
    const payload = {
      name: editForm.value.name.trim(),
      sn: editForm.value.sn.trim().toUpperCase(),
      minimum: editForm.value.minimum || null,
      discount: editForm.value.discount,
      takeCount: editForm.value.takeCount || 0,
      startTime: editForm.value.startDateTime || null,
      endTime: editForm.value.endDateTime || null,
      valid: newValid
    }

    await updateCoupon(editingCouponId.value, payload)
    await fetchCoupons()
    closeEditModal()
    alert('優惠券已更新')
  } catch (error) {
    console.error('更新優惠券失敗:', error)
    alert(error.response?.data?.error || error.message || '更新優惠券失敗，請稍後再試')
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>

