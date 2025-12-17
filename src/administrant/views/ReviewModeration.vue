<template>
  <div>
    <!-- 頁面標題 -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <ChatBubbleLeftRightIcon class="w-8 h-8 text-foreground" />
        <h1 class="text-3xl font-bold text-foreground">評論違規審查</h1>
      </div>
      <p class="text-muted-foreground">管理和審查用戶評論違規內容</p>
    </div>

    <!-- 統計概覽 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">載入中...</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="待審查"
        :value="stats.pending"
        :trend="stats.pending === 0 ? '審查完畢' : '需要審查'"
        :icon="ChatBubbleLeftRightIcon"
        iconColor="warning"
      />
      <StatCard
        title="已審查"
        :value="stats.resolved"
        :icon="ChatBubbleLeftRightIcon"
        iconColor="success"
      />
      <StatCard
        title="今日新增檢舉"
        :value="stats.todayNew"
        :icon="ClockIcon"
        iconColor="primary"
      />
      <StatCard
        title="本月總評論"
        :value="stats.monthTotal"
        :icon="DocumentTextIcon"
        iconColor="info"
      />
    </div>

    <!-- 評論列表表格 -->
    <div class="bg-card rounded-lg border border-border p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-foreground">檢舉列表</h2>
        <select
          v-model="statusFilter"
          class="ho-status-filter-select px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors"
        >
          <option value="ALL">全部</option>
          <option value="PENDING">待審查</option>
          <option value="RESOLVED">已審查</option>
        </select>
      </div>

      <div v-if="loading" class="text-center py-8">
        <p class="text-muted-foreground">載入中...</p>
      </div>
      <div v-else-if="filteredActions.length === 0" class="text-center py-8">
        <p class="text-muted-foreground">目前沒有被檢舉的評論</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border ho-table-header">
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">檢舉單編號</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">檢舉人ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">評論ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">評論作者ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">原因</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">狀態</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">建立時間</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">審查時間</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="action in filteredActions"
              :key="action.id"
              class="border-b border-border ho-table-row transition-colors"
            >
              <td class="px-4 py-4 text-foreground font-medium">#{{ action.id }}</td>
              <td class="px-4 py-4 text-foreground">{{ action.reporterId || '-' }}</td>
              <td class="px-4 py-4 text-foreground">{{ action.reviewId || '-' }}</td>
              <td class="px-4 py-4 text-foreground">{{ action.reviewAuthorId || '-' }}</td>
              <td class="px-4 py-4 text-foreground">{{ action.reasonDescription || getReasonLabel(action.reason) || '-' }}</td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <component 
                    :is="action.status === 'PENDING' ? ClockIcon : CheckCircleIcon" 
                    :class="[
                      'w-5 h-5',
                      action.status === 'PENDING' ? 'text-warning' : 'text-success'
                    ]"
                  />
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getStatusClass(action.status)"
                  >
                    {{ getStatusLabel(action.status) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4 text-muted-foreground text-sm">
                {{ formatDateTime(action.createdAt) }}
              </td>
              <td class="px-4 py-4 text-muted-foreground text-sm">
                {{ (action.actionTaken && action.actionTaken !== 'NONE' && action.reviewedAt) ? formatDateTime(action.reviewedAt) : '-' }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    v-if="action.status === 'PENDING'"
                    @click="handleProcess(action)"
                    class="review-action-btn px-4 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-lg hover:shadow-xl active:shadow-md border-2"
                  >
                    審查
                  </button>
                  <button
                    @click="openDetailModal(action)"
                    class="px-4 py-2 text-sm font-semibold border-2 border-primary/80 text-primary bg-primary/20 hover:bg-primary/30 rounded-lg transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-primary"
                  >
                    查看詳情
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 審查彈窗 -->
    <div
      v-if="showProcessModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeProcessModal"
    >
      <div class="rounded-lg shadow-xl max-w-md w-full mx-4 border border-border" style="background-color: var(--color-card);">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-xl font-bold text-foreground">審查檢舉</h3>
        </div>
        <div class="px-6 py-4">
          <div class="mb-4">
            <p class="text-sm text-muted-foreground mb-2">檢舉ID: #{{ processingAction?.id }}</p>
            <p class="text-sm text-muted-foreground mb-2">檢舉原因: {{ processingAction?.reasonDescription || getReasonLabel(processingAction?.reason) || '-' }}</p>
          </div>
          
          <!-- 被檢舉評論內容 -->
          <div class="mb-4">
            <label class="text-sm font-semibold text-foreground mb-2 block">被檢舉評論內容</label>
            <div class="mt-1 p-3 bg-muted rounded-lg border border-border">
              <p v-if="processingReviewContentLoading" class="text-muted-foreground text-sm">載入中...</p>
              <p v-else-if="processingReviewContent && processingReviewContent.trim()" class="text-foreground text-sm whitespace-pre-wrap">{{ processingReviewContent }}</p>
              <p v-else class="text-muted-foreground text-sm">(無)</p>
            </div>
          </div>

          <!-- 審查選項 -->
          <div class="mb-4">
            <label class="text-sm font-semibold text-foreground mb-3 block">審查結果</label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="selectedActionTaken"
                  value="KEEP"
                  class="w-4 h-4 text-success focus:ring-success"
                />
                <span class="text-foreground text-sm">保留評論</span>
                <span class="text-muted-foreground text-xs">（檢舉不成立，保留評論）</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="selectedActionTaken"
                  value="HIDE"
                  class="w-4 h-4 text-warning focus:ring-warning"
                />
                <span class="text-foreground text-sm">隱藏評論</span>
                <span class="text-muted-foreground text-xs">（將評論隱藏，前台顯示替代文字）</span>
                <!-- TODO: 前台專案需要實現以下功能：
                     1. 當 review.is_visible = 0 時，顯示替代文字「因違反內容規範，此評論已遭刪除」（帶刪除線）
                     2. 當 reply_is_visible = 0 時，回覆內容也需要顯示相同的替代文字
                     3. 後台查看詳情時仍可看到隱藏的評論內容（已完成）
                -->
              </label>
            </div>
          </div>

          <!-- 審查說明 -->
          <div class="mb-4">
            <label class="text-sm font-semibold text-foreground mb-2 block">
              說明（可留空）
            </label>
            <textarea
              v-model="reviewNote"
              rows="3"
              placeholder="可補充此次審查的原因或備註"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            ></textarea>
          </div>

          <div class="flex flex-col gap-3">
            <button
              @click="submitReview(processingAction)"
              :disabled="!selectedActionTaken"
              class="w-full px-6 py-2.5 text-base font-bold bg-success text-foreground rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg active:shadow-sm border-2 border-success hover:border-success/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              確認審查
            </button>
            <button
              @click="closeProcessModal"
              class="w-full px-6 py-2.5 text-base font-bold border-2 border-primary/80 text-primary bg-background rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-primary"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳情彈窗 -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeDetailModal"
    >
      <div class="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-border" style="background-color: var(--color-card);">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 class="text-xl font-bold text-foreground">檢舉詳情</h3>
          <button
            @click="closeDetailModal"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-6">
            <!-- 檢舉資訊 -->
            <div>
              <div class="space-y-3">
                <!-- 第一行：檢舉單編號 | 檢舉人ID -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-foreground">檢舉單編號</label>
                    <p class="text-foreground mt-1">#{{ detailAction?.id }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-foreground">檢舉人ID</label>
                    <p class="text-foreground mt-1">{{ detailAction?.reporterId || '-' }}</p>
                  </div>
                </div>

                <!-- 第二行：評論ID | 評論的作者ID -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-foreground">評論ID</label>
                    <p class="text-foreground mt-1">{{ detailAction?.reviewId || '-' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-foreground">評論的作者ID</label>
                    <p class="text-foreground mt-1">{{ detailAction?.reviewAuthorId || '-' }}</p>
                  </div>
                </div>

                <!-- 第三行：檢舉原因（單欄） -->
                <div>
                  <label class="text-sm font-semibold text-foreground">檢舉原因</label>
                  <p class="text-foreground mt-1">{{ detailAction?.reasonDescription || getReasonLabel(detailAction?.reason) || '-' }}</p>
                </div>

                <!-- 第四行：被檢舉評論內容（維持整行灰底不動） -->
                <div>
                  <label class="text-sm font-semibold text-foreground">被檢舉評論內容</label>
                  <div class="mt-1 p-3 bg-muted rounded-lg border border-border">
                    <p v-if="reviewContentLoading" class="text-muted-foreground text-sm">載入中...</p>
                    <p v-else-if="reviewContent && reviewContent.trim()" class="text-foreground text-sm whitespace-pre-wrap">{{ reviewContent }}</p>
                    <p v-else class="text-muted-foreground text-sm">(無)</p>
                  </div>
                </div>

                <!-- 審查說明 -->
                <div>
                  <label class="text-sm font-semibold text-foreground">審查說明</label>
                  <p
                    class="mt-1 text-sm"
                    :class="detailAction?.metadataNote ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ detailAction?.metadataNote || '（無）' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 審查資訊 -->
            <div>
              <div class="space-y-3">
                <!-- 第1行：左：狀態 | 右：審查結果 -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-foreground">狀態</label>
                    <div class="flex items-center gap-2 mt-1">
                      <component 
                        :is="detailAction?.status === 'PENDING' ? ClockIcon : CheckCircleIcon" 
                        :class="[
                          'w-5 h-5',
                          detailAction?.status === 'PENDING' ? 'text-warning' : 'text-success'
                        ]"
                      />
                      <span 
                        class="px-3 py-1 rounded-full text-sm font-medium"
                        :class="getStatusClass(detailAction?.status)"
                      >
                        {{ getStatusLabel(detailAction?.status) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-foreground">審查結果</label>
                    <p class="text-foreground mt-1 text-sm">{{ detailAction?.actionTaken ? getActionTakenLabel(detailAction.actionTaken) : '-' }}</p>
                  </div>
                </div>

                <!-- 第2行：左：審查人ID | 右：審查時間 -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-foreground">審查人ID</label>
                    <p class="text-foreground mt-1 text-sm">{{ (detailAction?.status === 'PENDING' || detailAction?.status === '待審查') ? '-' : (detailAction?.moderatorId || '-') }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-semibold text-foreground">審查時間</label>
                    <p class="text-foreground mt-1 text-sm">{{ (detailAction?.actionTaken && detailAction.actionTaken !== 'NONE' && detailAction?.reviewedAt) ? formatDateTime(detailAction.reviewedAt) : '-' }}</p>
                  </div>
                </div>

                <!-- 第3行：左：建立時間 | 右：—（或留空） -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-semibold text-foreground">建立時間</label>
                    <p class="text-foreground mt-1 text-sm">{{ detailAction?.createdAt ? formatDateTime(detailAction.createdAt) : '-' }}</p>
                  </div>
                  <div>
                    <!-- 右側留空 -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-border flex justify-end">
          <button
            @click="closeDetailModal"
            class="px-6 py-2.5 text-base font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-md hover:shadow-lg active:shadow-sm border-2 border-primary hover:border-primary-hover"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import StatCard from '@/administrant/components/StatCard.vue'
import { ChatBubbleLeftRightIcon, ClockIcon, CheckCircleIcon, DocumentTextIcon } from '@/administrant/components/icons'
import { listModerationActions, updateModerationAction, getMonthTotalReviews } from '@/administrant/api/moderation'
import { get } from '@/administrant/api/request'

const moderationActions = ref([])
const loading = ref(false)
const monthTotalReviews = ref(0)

// 狀態篩選
const statusFilter = ref('ALL')

// 審查彈窗
const showProcessModal = ref(false)
const processingAction = ref(null)
const selectedActionTaken = ref(null)
const reviewNote = ref('')
const processingReviewContent = ref('')
const processingReviewContentLoading = ref(false)

// 詳情彈窗
const showDetailModal = ref(false)
const detailAction = ref(null)
const reviewContent = ref('')
const reviewContentLoading = ref(false)

// 將 reason 轉換為後端 enum 值（不區分大小寫）
const normalizeReason = (reason) => {
  if (!reason) return null
  
  // 轉換為大寫進行比對，避免大小寫問題
  const upperReason = String(reason).toUpperCase().trim()
  
  // 如果已經是正確的 enum 值，直接返回
  const validReasons = ['ABUSE', 'SPAM', 'ADVERTISING', 'OFFENSIVE', 'OTHER']
  if (validReasons.includes(upperReason)) {
    return upperReason
  }
  
  // 將中文或其他格式轉換為 enum 值
  const mapping = {
    'ABUSE': 'ABUSE',
    'abuse': 'ABUSE',
    'Abuse': 'ABUSE',
    '辱罵字眼': 'ABUSE',
    '辱罵': 'ABUSE',
    'SPAM': 'SPAM',
    'spam': 'SPAM',
    'Spam': 'SPAM',
    '垃圾內容': 'SPAM',
    '垃圾': 'SPAM',
    'ADVERTISING': 'ADVERTISING',
    'advertising': 'ADVERTISING',
    'Advertising': 'ADVERTISING',
    '廣告訊息': 'ADVERTISING',
    '廣告': 'ADVERTISING',
    'OFFENSIVE': 'OFFENSIVE',
    'offensive': 'OFFENSIVE',
    'Offensive': 'OFFENSIVE',
    '不實資訊': 'OFFENSIVE',
    '冒犯性內容': 'OFFENSIVE',
    '不實': 'OFFENSIVE',
    'OTHER': 'OTHER',
    'other': 'OTHER',
    'Other': 'OTHER',
    '其他': 'OTHER',
    '評論內容不實': 'OFFENSIVE',
    '疑似惡意評論': 'ABUSE',
    '惡意評論': 'ABUSE',  // 新增：惡意評論映射到 ABUSE
    '評論內容不當': 'OFFENSIVE'
  }
  
  return mapping[reason] || mapping[upperReason] || 'OTHER'
}

// 將後端 enum 值轉換為中文顯示
const getReasonLabel = (reason) => {
  if (!reason) return '-'
  
  const upperReason = String(reason).toUpperCase().trim()
  const mapping = {
    'ABUSE': '辱罵字眼',
    'SPAM': '垃圾內容',
    'ADVERTISING': '廣告訊息',
    'OFFENSIVE': '冒犯性內容',
    'OTHER': '其他'
  }
  
  // 如果已經是中文，直接返回（處理資料庫中可能存在的舊資料）
  if (!upperReason || upperReason === reason) {
    // 檢查是否為中文
    const chineseMapping = {
      '辱罵字眼': '辱罵字眼',
      '垃圾內容': '垃圾內容',
      '廣告訊息': '廣告訊息',
      '冒犯性內容': '冒犯性內容',
      '其他': '其他',
      '惡意評論': '辱罵字眼',  // 將舊的「惡意評論」顯示為「辱罵字眼」
      '疑似惡意評論': '辱罵字眼',
      '評論內容不實': '冒犯性內容',
      '評論內容不當': '冒犯性內容'
    }
    if (chineseMapping[reason]) {
      return chineseMapping[reason]
    }
  }
  
  return mapping[upperReason] || reason
}

// 將中文 actionTaken 轉換為後端 enum 值
const normalizeActionTaken = (actionTaken) => {
  if (!actionTaken) return null
  
  // 如果已經是 enum 值，直接返回
  const normalized = String(actionTaken).toUpperCase().trim()
  const validValues = ['KEEP', 'DELETE', 'HIDE', 'NONE']
  if (validValues.includes(normalized)) {
    return normalized
  }
  
  // 將中文轉換為 enum 值
  const mapping = {
    '保留評論': 'KEEP',
    '保留': 'KEEP',
    '刪除評論': 'DELETE',
    '刪除': 'DELETE',
    '隱藏評論': 'HIDE',
    '隱藏': 'HIDE',
    '尚未審查': 'NONE',
    '尚未審核': 'NONE',
    '無需審查': 'KEEP'
  }
  
  return mapping[actionTaken] || mapping[normalized] || 'NONE'
}

// 將後端 enum 值轉換為中文顯示
const getActionTakenLabel = (actionTaken) => {
  if (!actionTaken) return '-'
  
  const normalized = String(actionTaken).toUpperCase().trim()
  const mapping = {
    'KEEP': '保留評論',
    'DELETE': '刪除評論',
    'HIDE': '隱藏評論',
    'NONE': '尚未審查'
  }
  
  return mapping[normalized] || actionTaken
}

// 轉換後端資料格式為前端格式
const transformModerationAction = (item) => {
  // 處理可能的 snake_case 或 camelCase 欄位名稱
  const id = item.id || item.ID
  const reporterId = item.reporterId || item.reporter_id
  const reviewId = item.reviewId || item.review_id
  const reviewAuthorId = item.reviewAuthorId || item.review_author_id
  const rawReason = item.reason
  const reasonDescription = item.reasonDescription || item.reason_description // 後端返回的中文描述
  const rawActionTaken = item.actionTaken || item.action_taken
  const moderatorId = item.moderatorId || item.moderator_id
  const status = item.status
  const createdAt = item.createdAt || item.created_at
  const reviewedAt = item.reviewedAt || item.reviewed_at
  const metadataRaw = item.metadata
  let metadataNote = ''
  if (metadataRaw === null || metadataRaw === undefined) {
    metadataNote = ''
  } else if (typeof metadataRaw === 'object') {
    metadataNote = metadataRaw.note || ''
  } else if (typeof metadataRaw === 'string') {
    try {
      const parsed = JSON.parse(metadataRaw)
      metadataNote = typeof parsed === 'object' ? (parsed.note || '') : metadataRaw
    } catch (error) {
      metadataNote = metadataRaw
    }
  } else {
    metadataNote = String(metadataRaw)
  }

  // 轉換狀態：後端返回 PENDING 或 RESOLVED
  let normalizedStatus = status
  if (typeof status === 'string') {
    const upperStatus = status.toUpperCase()
    if (upperStatus === 'RESOLVED' || status === '已審查' || status === '已完成') {
      normalizedStatus = 'RESOLVED'
    } else if (upperStatus === 'PENDING' || status === '待審查') {
      normalizedStatus = 'PENDING'
    }
  }

  return {
    id,
    reporterId,
    reviewId,
    reviewAuthorId,
    reason: rawReason, // 保留原始值用於顯示
    reasonDescription, // 後端返回的中文描述（從 Reason 枚舉獲取）
    reasonEnum: normalizeReason(rawReason), // 轉換後的 enum 值（用於發送給後端）
    actionTaken: rawActionTaken, // 保留原始值用於顯示
    actionTakenEnum: normalizeActionTaken(rawActionTaken), // 轉換後的 enum 值
    moderatorId,
    status: normalizedStatus,
    createdAt,
    reviewedAt,
    metadata: metadataRaw,
    metadataNote
  }
}

// 獲取審核操作列表（從後端 moderation_actions）
const fetchModerationActions = async () => {
  loading.value = true
  try {
    console.log('開始獲取審核操作列表...')
    const response = await listModerationActions()
    console.log('原始 API 響應:', response)
    console.log('響應類型:', typeof response)
    console.log('是否為數組:', Array.isArray(response))
    
    // 處理響應數據：axios 攔截器已經返回了 response.data
    // 後端在沒有分頁參數時返回 List<ModerationActionDTO>
    // 有分頁參數時返回 Page<ModerationActionDTO>
    let rawData = []
    
    if (Array.isArray(response)) {
      // 直接是數組（沒有分頁參數的情況）
      rawData = response
      console.log('檢測到數組格式，資料筆數:', rawData.length)
    } else if (response && typeof response === 'object') {
      // 如果是對象，檢查是否有 content 屬性（分頁響應）
      if (Array.isArray(response.content)) {
        rawData = response.content
        console.log('檢測到分頁格式 (content)，資料筆數:', rawData.length)
      } else if (Array.isArray(response.data)) {
        rawData = response.data
        console.log('檢測到嵌套 data 格式，資料筆數:', rawData.length)
      } else {
        // 如果不是數組，記錄警告
        rawData = []
        console.warn('API 返回的數據格式不符合預期:', response)
        console.warn('響應的鍵:', Object.keys(response))
      }
    } else {
      rawData = []
      console.warn('API 返回的數據為空或格式錯誤:', response)
    }

    console.log('處理後的原始資料筆數:', rawData.length)
    console.log('原始資料範例:', rawData.length > 0 ? rawData[0] : '無資料')

    // 轉換資料格式
    if (rawData.length > 0) {
      moderationActions.value = rawData.map(transformModerationAction)
      console.log('轉換後的 Moderation Actions 筆數:', moderationActions.value.length)
      console.log('轉換後的資料範例:', moderationActions.value[0])
    } else {
      moderationActions.value = []
      console.log('沒有資料需要轉換')
    }
  } catch (error) {
    console.error('獲取審核操作失敗:', error)
    console.error('錯誤詳情:', error.response || error.message)
    moderationActions.value = []
  } finally {
    loading.value = false
  }
}

// 獲取本月總評論數
const fetchMonthTotalReviews = async () => {
  try {
    const response = await getMonthTotalReviews()
    const data = response.data || response
    monthTotalReviews.value = data.count || 0
  } catch (error) {
    console.error('獲取本月總評論數失敗:', error)
    monthTotalReviews.value = 0
  }
}

// 計算統計數據
const stats = computed(() => {
  const pending = moderationActions.value.filter(action => action.status === 'PENDING').length
  const resolved = moderationActions.value.filter(action => action.status === 'RESOLVED').length
  
  // 計算今日新增檢舉
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayNew = moderationActions.value.filter(action => {
    if (!action.createdAt) return false
    const actionDate = new Date(action.createdAt)
    actionDate.setHours(0, 0, 0, 0)
    return actionDate.getTime() === today.getTime()
  }).length
  
  return {
    pending,
    resolved,
    todayNew,
    monthTotal: monthTotalReviews.value // 從 API 獲取的本月總評論數
  }
})

// 列表（按建立時間降序排序，最新的在前，並根據狀態篩選）
const filteredActions = computed(() => {
  let filtered = [...moderationActions.value]
  
  // 根據狀態篩選
  if (statusFilter.value !== 'ALL') {
    filtered = filtered.filter(action => action.status === statusFilter.value)
  }
  
  // 按建立時間降序排序
  filtered.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })
  
  return filtered
})

// 獲取狀態標籤
const getStatusLabel = (status) => {
  const labels = {
    'PENDING': '待審查',
    'RESOLVED': '已審查'
  }
  return labels[status] || status
}

// 獲取狀態樣式
const getStatusClass = (status) => {
  if (status === 'PENDING') {
    // 待審查：淡綠色背景，深綠色文字（高對比）
    return 'bg-green-100 text-green-800 border-2 border-green-500 font-semibold dark:bg-green-800 dark:text-green-100 dark:border-green-400'
  } else if (status === 'RESOLVED') {
    // 已審查：淺藍色背景，深藍色文字（高對比）
    return 'bg-blue-100 text-blue-800 border-2 border-blue-500 font-semibold dark:bg-blue-800 dark:text-blue-100 dark:border-blue-400'
  }
  return 'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
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
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 打開審查彈窗
const handleProcess = async (action) => {
  processingAction.value = action
  selectedActionTaken.value = null
  reviewNote.value = ''
  processingReviewContent.value = ''
  reviewNote.value = action?.metadataNote || ''
  processingReviewContentLoading.value = false
  showProcessModal.value = true
  // 獲取評論內容
  if (action?.reviewId) {
    await fetchProcessingReviewContent(action.reviewId)
  }
}

// 獲取審查彈窗中的評論內容
const fetchProcessingReviewContent = async (reviewId) => {
  if (!reviewId) {
    processingReviewContent.value = ''
    return
  }
  
  processingReviewContentLoading.value = true
  processingReviewContent.value = ''
  
  try {
    const response = await get(`/api/moderation-actions/review/${reviewId}`)
    const data = response.data || response
    
    if (data.error) {
      processingReviewContent.value = ''
    } else {
      const content = data.comment || data.content || data.text || data.message || ''
      processingReviewContent.value = content && content.trim() ? content : ''
    }
  } catch (error) {
    console.error('獲取評論內容失敗:', error)
    processingReviewContent.value = ''
  } finally {
    processingReviewContentLoading.value = false
  }
}

// 關閉審查彈窗
const closeProcessModal = () => {
  showProcessModal.value = false
  processingAction.value = null
  selectedActionTaken.value = null
  reviewNote.value = ''
  processingReviewContent.value = ''
  processingReviewContentLoading.value = false
}

// 獲取評論內容
const fetchReviewContent = async (reviewId) => {
  if (!reviewId) {
    reviewContent.value = ''
    return
  }
  
  reviewContentLoading.value = true
  reviewContent.value = ''
  
  try {
    // 使用後端提供的 API 端點，通過原生 SQL 查詢 review 表
    const response = await get(`/api/moderation-actions/review/${reviewId}`)
    const data = response.data || response
    
    if (data.error) {
      reviewContent.value = ''
    } else {
      const content = data.comment || data.content || data.text || data.message || ''
      reviewContent.value = content && content.trim() ? content : ''
    }
  } catch (error) {
    console.error('獲取評論內容失敗:', error)
    reviewContent.value = ''
  } finally {
    reviewContentLoading.value = false
  }
}

// 打開詳情彈窗
const openDetailModal = async (action) => {
  detailAction.value = action
  showDetailModal.value = true
  // 獲取評論內容
  if (action?.reviewId) {
    await fetchReviewContent(action.reviewId)
  }
}

// 關閉詳情彈窗
const closeDetailModal = () => {
  showDetailModal.value = false
  detailAction.value = null
  reviewContent.value = ''
  reviewContentLoading.value = false
}

// 提交審查結果
const submitReview = async (action) => {
  if (!action || !selectedActionTaken.value) return
  
  try {
    const noteToSave = (reviewNote.value || '').trim()
    // 先保存選擇的動作，因為 closeProcessModal 會清空 selectedActionTaken
    const actionTakenValue = selectedActionTaken.value
    // TODO: 確認後端是否需要自動設置 reviewedAt，還是前端傳入即可
    await updateModerationAction(action.id, {
      status: 'RESOLVED', // 後端 Status enum 使用 RESOLVED
      actionTaken: actionTakenValue, // KEEP 或 HIDE
      reviewedAt: new Date().toISOString(), // 審查時間
      metadata: noteToSave
    })
    await fetchModerationActions()
    
    // 在關閉前先取得動作標籤
    const actionLabel = actionTakenValue === 'KEEP' ? '保留評論' : '隱藏評論'
    closeProcessModal()
    
    alert(`審查完成：${actionLabel}`)
  } catch (error) {
    console.error('審查失敗:', error)
    alert('操作失敗')
  }
}


onMounted(() => {
  fetchModerationActions()
  fetchMonthTotalReviews()
})
</script>

<style scoped>
/* 審查按鈕 - 使用深色 success 顏色以確保在淺色模式下可見 */
.review-action-btn {
  background-color: hsl(162 60% 38%);
  border-color: hsl(162 60% 32%);
}

.review-action-btn:hover {
  background-color: hsl(162 60% 35%);
  border-color: hsl(162 60% 30%);
}

/* 深色模式下的樣式覆蓋 */
:deep(.ho-app[data-theme="dark"]) .review-action-btn,
:deep(html[data-theme="dark"] .ho-app) .review-action-btn {
  background-color: hsl(174 58% 48%);
  border-color: hsl(174 58% 42%);
}

:deep(.ho-app[data-theme="dark"]) .review-action-btn:hover,
:deep(html[data-theme="dark"] .ho-app) .review-action-btn:hover {
  background-color: hsl(174 58% 45%);
  border-color: hsl(174 58% 40%);
}
</style>
