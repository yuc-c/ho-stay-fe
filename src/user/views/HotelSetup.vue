<template>
  <Layout>
    <div class="px-8 pt-4 pb-8 flex flex-col items-center">
      <div class="w-full max-w-4xl">
        <Button variant="ghost" @click="navigate('/')" class="mb-4">
          <ArrowLeft class="mr-2 h-4 w-4" />
          返回飯店列表
        </Button>

        <!-- 步驟指示器 -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-foreground">飯店設置</h1>
            <div class="text-sm text-muted-foreground">
              步驟 {{ currentStep }} / {{ totalSteps }}
            </div>
          </div>
          
          <!-- 步驟進度條 -->
          <div class="flex items-center gap-2">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex items-center flex-1"
            >
              <div class="flex items-center gap-2 flex-1">
                <!-- 步驟圓圈 -->
                <div
                  :class="[
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    step.completed
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === index + 1
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                  ]"
                >
                  <Check v-if="step.completed" class="h-5 w-5" />
                  <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
                </div>
                <!-- 連接線 -->
                <div
                  v-if="index < steps.length - 1"
                  :class="[
                    'h-0.5 flex-1 transition-colors',
                    step.completed ? 'bg-primary' : 'bg-muted'
                  ]"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步驟內容 -->
        <Card class="shadow-soft mb-6">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-2xl">
                  {{ steps[currentStep - 1].title }}
                </CardTitle>
                <CardDescription class="mt-2">
                  {{ steps[currentStep - 1].description }}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <!-- 步驟 1: 住宿資訊 -->
            <div v-if="currentStep === 1" class="space-y-4">
              <div class="rounded-lg bg-muted/50 p-4 space-y-3">
                <p class="text-sm font-medium">此步驟需要填寫的資訊包括：</p>
                <ul class="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>飯店名稱、類型、描述</li>
                  <li>地址資訊（城市、行政區、道路、門牌號碼）</li>
                  <li>聯絡方式（手機、市話）</li>
                  <li><strong>執照號碼</strong>（必填）</li>
                  <li>星級評等</li>
                  <li>入住/退房時間</li>
                  <li>營業狀態</li>
                </ul>
              </div>
              <Button 
                @click="navigate(hotelId ? `/hotels/${hotelId}?from=setup` : '/hotels/new?from=setup')" 
                class="w-full"
              >
                {{ hotelId ? '編輯住宿資訊' : '開始填寫住宿資訊' }}
              </Button>
              <p class="text-xs text-muted-foreground text-center">
                完成後請返回此頁面繼續下一步
              </p>
            </div>

            <!-- 步驟 2: 客房 -->
            <div v-if="currentStep === 2" class="space-y-4">
              <div v-if="hotelId">
                <!-- 載入狀態 -->
                <div v-if="loadingRoomTypes" class="flex items-center justify-center py-8">
                  <div class="text-center">
                    <div class="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-sm text-muted-foreground">載入中...</p>
                  </div>
                </div>
                
                <!-- 顯示已添加的房型列表 -->
                <div v-else-if="roomTypes.length > 0" class="mb-6">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium text-foreground">目前已新增的客房（{{ roomTypes.length }} 間）</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="navigate(`/hotels/${hotelId}/room-types/new?from=setup&step=2`)"
                    >
                      <Plus class="mr-2 h-4 w-4" />
                      新增客房
                    </Button>
                  </div>
                  <div class="grid gap-3 md:grid-cols-2">
                    <div
                      v-for="room in roomTypes"
                      :key="room.id"
                      class="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <h5 class="font-semibold text-foreground truncate">{{ room.name }}</h5>
                          <p v-if="room.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {{ room.description }}
                          </p>
                          <div class="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span v-if="room.maxOccupancy">最多 {{ room.maxOccupancy }} 人</span>
                            <span v-if="room.size">{{ room.size }} 平方公尺</span>
                            <span v-if="room.quantity">共 {{ room.quantity }} 間</span>
                          </div>
                          <div class="mt-2">
                            <span class="text-sm font-semibold text-primary">
                              NT$ {{ formatPrice(room.basePrice) }}
                            </span>
                            <span class="text-xs text-muted-foreground">/ 晚</span>
                          </div>
                        </div>
                        <Badge :variant="room.status === 1 ? 'default' : 'secondary'" class="ml-2 flex-shrink-0">
                          {{ room.status === 1 ? '啟用' : '停用' }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 空狀態 -->
                <div v-else class="text-center py-8">
                  <div class="mb-4 flex justify-center">
                    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Plus class="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h4 class="mb-2 text-lg font-semibold text-foreground">尚未新增任何客房</h4>
                  <p class="mb-6 text-sm text-muted-foreground">
                    請新增至少一間客房，讓顧客可以選擇不同的房型
                  </p>
                  <Button
                    @click="navigate(`/hotels/${hotelId}/room-types/new?from=setup&step=2`)"
                    size="lg"
                  >
                    <Plus class="mr-2 h-5 w-5" />
                    新增第一間客房
                  </Button>
                </div>
              </div>
              <div v-else class="text-center py-8 text-muted-foreground">
                <p>請先完成步驟 1：住宿資訊</p>
              </div>
            </div>

            <!-- 步驟 3: 相片 -->
            <div v-if="currentStep === 3" class="space-y-4">
              <div v-if="hotelId">
                <!-- 載入狀態 -->
                <div v-if="loadingPhotos" class="flex items-center justify-center py-8">
                  <div class="text-center">
                    <div class="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-sm text-muted-foreground">載入中...</p>
                  </div>
                </div>
                
                <!-- 有照片時顯示狀態 -->
                <div v-else-if="photos.length > 0" class="mb-4">
                  <div class="rounded-lg border border-border bg-card p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Image class="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 class="text-sm font-semibold text-foreground">已上傳 {{ photos.length }} 張照片</h4>
                          <p class="text-xs text-muted-foreground">
                            {{ photos.length >= 3 ? '已達到最低要求' : `還需要 ${3 - photos.length} 張` }}
                          </p>
                        </div>
                      </div>
                      <Badge :variant="photos.length >= 3 ? 'default' : 'secondary'" class="text-sm">
                        {{ photos.length >= 3 ? '完成' : '進行中' }}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <!-- 操作按鈕 -->
                <div class="space-y-4">
                  <p v-if="photos.length === 0" class="text-sm text-muted-foreground">
                    請上傳飯店照片，幫助顧客了解您的住宿環境。至少需要 3 張照片。
                  </p>
                  <Button
                    @click="navigate(`/hotels/${hotelId}/images?from=setup&step=3`)"
                    class="w-full"
                    :variant="photos.length >= 3 ? 'outline' : 'default'"
                  >
                    <Image class="mr-2 h-4 w-4" />
                    {{ photos.length === 0 ? '前往照片管理' : photos.length >= 3 ? '管理照片' : '繼續上傳照片' }}
                  </Button>
                </div>
              </div>
              <div v-else class="text-center py-8 text-muted-foreground">
                <p>請先完成步驟 1：住宿資訊</p>
              </div>
            </div>

            <!-- 步驟 4: 設施 -->
            <div v-if="currentStep === 4" class="space-y-4">
              <div v-if="hotelId">
                <!-- 載入狀態 -->
                <div v-if="loadingFacilities" class="flex items-center justify-center py-8">
                  <div class="text-center">
                    <div class="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-sm text-muted-foreground">載入中...</p>
                  </div>
                </div>
                
                <!-- 有設施時顯示狀態 -->
                <div v-else-if="facilities.length > 0" class="mb-4">
                  <div class="rounded-lg border border-border bg-card p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Wrench class="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 class="text-sm font-semibold text-foreground">已選擇 {{ facilities.length }} 項設施</h4>
                          <p class="text-xs text-muted-foreground">
                            已達到最低要求
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">完成</Badge>
                    </div>
                  </div>
                </div>
                
                <!-- 操作按鈕 -->
                <div class="space-y-4">
                  <p v-if="facilities.length === 0" class="text-sm text-muted-foreground">
                    至少需要選擇 1 項設施。
                  </p>
                  <Button
                    @click="navigate(`/hotels/${hotelId}/facilities?from=setup&step=4`)"
                    class="w-full"
                    :variant="facilities.length > 0 ? 'outline' : 'default'"
                  >
                    <Wrench class="mr-2 h-4 w-4" />
                    {{ facilities.length === 0 ? '前往設施管理' : '管理設施' }}
                  </Button>
                </div>
              </div>
              <div v-else class="text-center py-8 text-muted-foreground">
                <p>請先完成步驟 1：住宿資訊</p>
              </div>
            </div>

            <!-- 完成提示（當所有步驟完成時顯示） -->
            <div v-if="currentStep === totalSteps && steps.every(s => s.completed)" class="space-y-4">
              <div class="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-6">
                <div class="flex items-start gap-3">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                    <Check class="h-5 w-5" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                      恭喜！所有步驟已完成
                    </h3>
                    <p class="text-sm text-green-800 dark:text-green-200 mb-3">
                      您的飯店現在可以開始接受預訂了。所有付款將透過平台線上付款服務處理。
                    </p>
                    <p class="text-xs text-green-700 dark:text-green-300">
                      提示：完成註冊後，您可以在飯店列表頁面開啟營業狀態，讓顧客開始預訂。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 導航按鈕 -->
        <div class="flex justify-between gap-4">
          <Button
            v-if="currentStep > 1"
            variant="outline"
            @click="previousStep"
            class="border-2"
          >
            <ArrowLeft class="mr-2 h-4 w-4" />
            返回
          </Button>
          <div v-else></div>
          
          <Button
            v-if="currentStep < totalSteps"
            @click="nextStep"
            class="min-w-[120px]"
          >
            繼續
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
          <Button
            v-else
            @click="handleComplete"
            class="min-w-[120px]"
          >
            <Check class="mr-2 h-4 w-4" />
            完成註冊
          </Button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, Edit, Plus, Image, Wrench } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Layout from '@/user/layouts/OwnerLayout.vue'
import Button from '@/user/components/ui/Button.vue'
import Card from '@/user/components/ui/Card.vue'
import CardContent from '@/user/components/ui/CardContent.vue'
import CardHeader from '@/user/components/ui/CardHeader.vue'
import CardTitle from '@/user/components/ui/CardTitle.vue'
import CardDescription from '@/user/components/ui/CardDescription.vue'
import Badge from '@/user/components/ui/Badge.vue'
import { roomAPI } from '@/user/api/room'
import { photoAPI } from '@/user/api/photo'
import { hotelFacilityAPI } from '@/user/api/facility'
import { hotelAPI } from '@/user/api/hotel'

const router = useRouter()
const route = useRoute()

const currentStep = ref(1)
const hotelId = ref(null)
const roomTypes = ref([])
const loadingRoomTypes = ref(false)
const photos = ref([])
const facilities = ref([])
const loadingPhotos = ref(false)
const loadingFacilities = ref(false)

const steps = ref([
  {
    title: '步驟 1 住宿資訊',
    description: '請提供基本資料，如：住宿名稱、地址、設施等。',
    completed: false,
  },
  {
    title: '步驟 2 客房',
    description: '新增另一間不同格局、床型選項與房價的客房。',
    completed: false,
  },
  {
    title: '步驟 3 相片',
    description: '請提供一些貴住宿的相片，幫助顧客了解貴住宿。',
    completed: false,
  },
  {
    title: '步驟 4 設施',
    description: '選擇此飯店提供的設施，幫助顧客了解您的服務。',
    completed: false,
  },
])

const totalSteps = computed(() => steps.value.length)

onMounted(async () => {
  // 如果有 hotelId 參數，表示正在編輯現有飯店
  if (route.params.hotelId) {
    hotelId.value = parseInt(route.params.hotelId)
    // 標記步驟1為完成（因為已經有飯店ID，表示基本資訊已填寫）
    steps.value[0].completed = true
    
    // 檢查是否有 step 查詢參數，如果有則跳轉到指定步驟
    if (route.query.step) {
      const targetStep = parseInt(route.query.step)
      if (targetStep >= 1 && targetStep <= totalSteps.value) {
        currentStep.value = targetStep
      }
    }
    
    // 可以從 API 獲取飯店資訊，判斷哪些步驟已完成
    await checkCompletedSteps()
    
    // 載入當前步驟的數據（統一處理）
    await loadStepData(currentStep.value)
  }
})

// 載入照片數據
const fetchPhotos = async () => {
  if (!hotelId.value) return
  
  loadingPhotos.value = true
  try {
    const photoList = await photoAPI.getPhotosByHotelId(hotelId.value)
    photos.value = Array.isArray(photoList) ? photoList : []
    steps.value[2].completed = photos.value.length >= 3
  } catch (error) {
    console.error('載入照片列表失敗：', error)
    photos.value = []
  } finally {
    loadingPhotos.value = false
  }
}

// 載入設施數據
const fetchFacilities = async () => {
  if (!hotelId.value) return
  
  loadingFacilities.value = true
  try {
    // 優化：先從飯店數據中檢查 facilityIds，避免不必要的 API 調用
    const hotelData = await hotelAPI.getHotelForOwner(hotelId.value)
    if (hotelData && Array.isArray(hotelData.facilityIds) && hotelData.facilityIds.length > 0) {
      // 如果飯店數據中有設施 ID，直接使用（轉換為對象列表格式用於顯示）
      facilities.value = hotelData.facilityIds.map(id => ({ id }))
      steps.value[3].completed = true
    } else {
      // 如果飯店數據中沒有設施，嘗試從專用 API 獲取（可能用戶剛設置了設施但數據還沒同步）
      try {
        const facilityList = await hotelFacilityAPI.getHotelFacilities(hotelId.value)
        facilities.value = Array.isArray(facilityList) ? facilityList : []
        steps.value[3].completed = facilities.value.length > 0
      } catch (apiError) {
        // 404 錯誤表示飯店尚未設置設施，這是正常情況，靜默處理
        const is404 = apiError?.status === 404 || apiError?.errorMessage === 'Not Found' || apiError?.message?.includes('404')
        if (is404) {
          // 404 是正常情況（飯店可能還沒有設施），靜默處理
          facilities.value = []
          steps.value[3].completed = false
        } else {
          // 其他錯誤，靜默處理
          if (import.meta.env.DEV) {
            console.warn('載入設施列表失敗：', apiError)
          }
          facilities.value = []
          steps.value[3].completed = false
        }
      }
    }
  } catch (error) {
    // 獲取飯店數據失敗，靜默處理
    if (import.meta.env.DEV) {
      console.warn('獲取飯店數據失敗，無法載入設施列表：', error)
    }
    facilities.value = []
    steps.value[3].completed = false
  } finally {
    loadingFacilities.value = false
  }
}

// 統一載入步驟數據的函數
const loadStepData = async (step) => {
  if (!hotelId.value) return
  
  switch (step) {
    case 2:
      await fetchRoomTypes()
      break
    case 3:
      await fetchPhotos()
      break
    case 4:
      await fetchFacilities()
      break
  }
}

// 監聽步驟變化，當切換到不同步驟時載入對應數據
watch(currentStep, async (newStep) => {
  await loadStepData(newStep)
})

// 監聽路由變化，當從其他頁面返回時重新載入當前步驟數據
watch(() => route.query.step, async (newStep) => {
  if (newStep && hotelId.value) {
    const targetStep = parseInt(newStep)
    if (targetStep >= 1 && targetStep <= totalSteps.value) {
      await loadStepData(targetStep)
    }
  }
})

// 監聽頁面可見性，當頁面重新可見時重新檢查步驟完成狀態並載入數據
if (typeof window !== 'undefined') {
  let visibilityCheckTimer = null
  let lastCheckTime = 0
  const CHECK_THROTTLE = 2000 // 2秒內最多檢查一次
  
  const handlePageVisible = async () => {
    if (!document.hidden && hotelId.value) {
      const now = Date.now()
      // 防抖：如果距離上次檢查不到 2 秒，則跳過
      if (now - lastCheckTime < CHECK_THROTTLE) {
        return
      }
      
      // 清除之前的定時器
      if (visibilityCheckTimer) {
        clearTimeout(visibilityCheckTimer)
      }
      
      // 延遲執行，避免頻繁觸發
      visibilityCheckTimer = setTimeout(async () => {
        lastCheckTime = Date.now()
        // 重新檢查所有步驟完成狀態
        await checkCompletedSteps()
        // 重新載入當前步驟的數據
        await loadStepData(currentStep.value)
      }, 300) // 300ms 延遲
    }
  }
  
  document.addEventListener('visibilitychange', handlePageVisible)
  window.addEventListener('focus', handlePageVisible)
}

const checkCompletedSteps = async () => {
  if (!hotelId.value) {
    console.warn('checkCompletedSteps: hotelId 為空')
    return
  }
  
  try {
    // 步驟1：基本資訊（已有 hotelId 表示完成）
    steps.value[0].completed = true
    if (import.meta.env.DEV) {
      console.log('步驟1完成狀態：', steps.value[0].completed)
    }
    
    // 步驟2：檢查房型
    try {
      const rooms = await roomAPI.getRoomsByHotelIdForOwner(hotelId.value)
      const hasRooms = Array.isArray(rooms) && rooms.length > 0
      steps.value[1].completed = hasRooms
      if (import.meta.env.DEV) {
        console.log('步驟2完成狀態：', hasRooms, '房型數量：', Array.isArray(rooms) ? rooms.length : 0)
      }
    } catch (error) {
      console.error('檢查房型狀態失敗：', error)
      steps.value[1].completed = false
      if (import.meta.env.DEV) {
        console.error('步驟2檢查失敗，錯誤：', error)
      }
    }
    
    // 步驟3：檢查照片（至少3張）
    try {
      const photos = await photoAPI.getPhotosByHotelId(hotelId.value)
      const hasEnoughPhotos = Array.isArray(photos) && photos.length >= 3
      steps.value[2].completed = hasEnoughPhotos
      if (import.meta.env.DEV) {
        console.log('步驟3完成狀態：', hasEnoughPhotos, '照片數量：', Array.isArray(photos) ? photos.length : 0)
      }
    } catch (error) {
      console.error('檢查照片狀態失敗：', error)
      steps.value[2].completed = false
      if (import.meta.env.DEV) {
        console.error('步驟3檢查失敗，錯誤：', error)
      }
    }
    
    // 步驟4：檢查設施（至少選擇1個設施）
    // 優化：先從飯店數據中檢查 facilityIds，避免不必要的 API 調用
    try {
      // 先從飯店數據中獲取設施信息（避免 404 錯誤）
      const hotelData = await hotelAPI.getHotelForOwner(hotelId.value)
      if (hotelData && Array.isArray(hotelData.facilityIds) && hotelData.facilityIds.length > 0) {
        // 如果飯店數據中有設施 ID，直接標記為完成
        steps.value[3].completed = true
        if (import.meta.env.DEV) {
          console.log('步驟4完成狀態（從飯店數據）：', true, '設施數量：', hotelData.facilityIds.length)
        }
      } else {
        // 如果飯店數據中沒有設施，嘗試從專用 API 獲取（可能用戶剛設置了設施但數據還沒同步）
        try {
          const facilities = await hotelFacilityAPI.getHotelFacilities(hotelId.value)
          const hasFacilities = Array.isArray(facilities) && facilities.length > 0
          steps.value[3].completed = hasFacilities
          if (import.meta.env.DEV) {
            console.log('步驟4完成狀態（從設施 API）：', hasFacilities, '設施數量：', Array.isArray(facilities) ? facilities.length : 0)
          }
        } catch (apiError) {
          // 404 錯誤表示飯店尚未設置設施，這是正常情況，靜默處理
          const is404 = apiError?.status === 404 || apiError?.errorMessage === 'Not Found' || apiError?.message?.includes('404')
          if (is404) {
            // 404 是正常情況（飯店可能還沒有設施），靜默處理
            steps.value[3].completed = false
            if (import.meta.env.DEV) {
              console.log('步驟4完成狀態：', false, '（飯店尚未設置設施）')
            }
          } else {
            // 其他錯誤，靜默處理
            if (import.meta.env.DEV) {
              console.warn('檢查設施狀態失敗：', apiError)
            }
            steps.value[3].completed = false
          }
        }
      }
    } catch (error) {
      // 獲取飯店數據失敗，靜默處理
      if (import.meta.env.DEV) {
        console.warn('獲取飯店數據失敗，無法檢查設施狀態：', error)
      }
      steps.value[3].completed = false
    }
    
    // 輸出所有步驟的完成狀態
    if (import.meta.env.DEV) {
      console.log('所有步驟完成狀態：', steps.value.map((s, i) => ({
        步驟: i + 1,
        標題: s.title,
        完成: s.completed
      })))
    }
  } catch (error) {
    console.error('檢查步驟完成狀態失敗：', error)
  }
}

const fetchRoomTypes = async () => {
  if (!hotelId.value) return
  
  loadingRoomTypes.value = true
  try {
    const rooms = await roomAPI.getRoomsByHotelIdForOwner(hotelId.value)
    roomTypes.value = Array.isArray(rooms) ? rooms : []
    
    // 如果有房型，標記步驟2為完成
    if (roomTypes.value.length > 0) {
      steps.value[1].completed = true
    }
  } catch (error) {
    console.error('載入房型列表失敗：', error)
    roomTypes.value = []
  } finally {
    loadingRoomTypes.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '0'
  return parseInt(price).toLocaleString('zh-TW')
}

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 1:
      return hotelId.value !== null
    case 2:
      return roomTypes.value.length > 0
    case 3:
      // 照片檢查在 watch 中進行，這裡只檢查是否有 hotelId
      return hotelId.value !== null
    case 4:
      // 設施檢查在 watch 中進行，這裡只檢查是否有 hotelId
      return hotelId.value !== null
    default:
      return true
  }
}

const nextStep = () => {
  // 驗證當前步驟是否完成
  if (!validateCurrentStep()) {
    const stepNames = ['住宿資訊', '客房', '相片', '設施']
    toast.warning(`請先完成步驟 ${currentStep.value}：${stepNames[currentStep.value - 1]}`)
    return
  }
  
  if (currentStep.value < totalSteps.value) {
    // 標記當前步驟為完成
    steps.value[currentStep.value - 1].completed = true
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleEditStep = (stepNumber) => {
  currentStep.value = stepNumber
  steps.value[stepNumber - 1].completed = false
}

const handleComplete = async () => {
  // 重新檢查所有步驟完成狀態
  await checkCompletedSteps()
  
  // 驗證所有步驟是否完成
  const allCompleted = steps.value.every(s => s.completed)
  
  if (!allCompleted) {
    // 找出未完成的步驟並顯示詳細信息
    const incompleteSteps = steps.value
      .map((step, index) => ({ step, index: index + 1 }))
      .filter(({ step }) => !step.completed)
    
    if (incompleteSteps.length > 0) {
      const stepNames = ['住宿資訊', '客房', '相片', '設施']
      const incompleteNames = incompleteSteps.map(({ index }) => stepNames[index - 1]).join('、')
      toast.warning(`請完成以下步驟：${incompleteNames}`)
      
      // 跳轉到第一個未完成的步驟
      currentStep.value = incompleteSteps[0].index
    } else {
      toast.warning('請完成所有步驟後再完成註冊')
    }
    return
  }
  
  // 標記最後一步為完成
  steps.value[currentStep.value - 1].completed = true
  
  // 所有付款將透過平台線上付款服務處理，無需額外設定
  toast.success('飯店設置完成！您的飯店現在可以開始接受預訂了。所有付款將透過平台線上付款服務處理。')
  router.push('/')
}

const navigate = (path) => {
  router.push(path)
}
</script>

