<template>
  <Layout>
    <div class="px-8 pt-4 pb-8 max-w-7xl mx-auto">
      <Button variant="ghost" @click="handleBack" class="mb-4">
        <ArrowLeft class="mr-2 h-4 w-4" />
        返回
      </Button>

      <div class="mb-8 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Settings class="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-foreground">設施管理</h1>
              <p class="mt-1 text-muted-foreground">{{ hotelName ? `管理「${hotelName}」的設施` : '管理設施資訊' }}</p>
            </div>
          </div>
        </div>
      </div>

      <Card class="shadow-soft">
        <CardHeader>
          <CardTitle class="text-2xl">選擇設施</CardTitle>
          <CardDescription>
            選擇此飯店提供的設施（可多選）
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div v-if="loading" class="flex h-full items-center justify-center py-16">
            <div class="text-muted-foreground">載入中...</div>
          </div>

          <div v-else-if="error" class="text-destructive">
            {{ error }}
          </div>

          <div v-else class="space-y-6">
            <!-- 搜尋和統計區域 -->
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <!-- 搜尋框 -->
              <div class="relative flex-1 w-full sm:max-w-md">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  v-model="searchQuery"
                  placeholder="搜尋設施..."
                  class="pl-9 pr-9"
                />
                <Button
                  v-if="searchQuery"
                  variant="ghost"
                  size="sm"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  @click="searchQuery = ''"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
              
              <!-- 已選設施統計 -->
              <div class="flex items-center gap-4 text-sm">
                <div class="text-muted-foreground">
                  已選 <span class="font-semibold text-foreground">{{ selectedFacilityIds.length }}</span> / {{ filteredFacilities.length }} 項
                </div>
                <!-- 篩選按鈕 -->
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :class="filterMode === 'all' ? 'bg-primary/10 border-primary' : ''"
                    @click="filterMode = 'all'"
                  >
                    全部
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :class="filterMode === 'selected' ? 'bg-primary/10 border-primary' : ''"
                    @click="filterMode = 'selected'"
                  >
                    已選
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :class="filterMode === 'unselected' ? 'bg-primary/10 border-primary' : ''"
                    @click="filterMode = 'unselected'"
                  >
                    未選
                  </Button>
                </div>
              </div>
            </div>

            <div v-if="facilities.length === 0" class="text-center py-12 text-muted-foreground">
              <p>沒有可用的設施</p>
            </div>

            <!-- 修改：按分類分組顯示設施 -->
            <div v-else v-for="(categoryFacilities, category) in filteredGroupedFacilities" :key="category" class="space-y-4">
              <!-- 分類標題（可摺疊） -->
              <div class="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 w-8 p-0"
                  @click="toggleCategory(category)"
                >
                  <ChevronDown v-if="expandedCategories[category]" class="h-4 w-4" />
                  <ChevronUp v-else class="h-4 w-4" />
                </Button>
                <h3 class="text-base font-semibold text-foreground">
                  {{ category }}
                </h3>
                <div class="flex-1 border-t border-border"></div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-muted-foreground">
                    {{ getSelectedCountInCategory(categoryFacilities) }} / {{ categoryFacilities.length }} 項
                  </span>
                  <!-- 批量操作按鈕 -->
                  <Button
                    v-if="categoryFacilities.length > 0"
                    variant="ghost"
                    size="sm"
                    class="h-8 text-sm"
                    @click.stop="toggleCategorySelection(category, categoryFacilities)"
                  >
                    <CheckSquare v-if="isCategoryAllSelected(categoryFacilities)" class="mr-1.5 h-3.5 w-3.5" />
                    <Square v-else class="mr-1.5 h-3.5 w-3.5" />
                    {{ isCategoryAllSelected(categoryFacilities) ? '取消全選' : '全選' }}
                  </Button>
                </div>
              </div>

              <!-- 該分類下的設施（可摺疊） -->
              <div v-if="expandedCategories[category]" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                <Card
                  v-for="facility in categoryFacilities"
                  :key="facility.id"
                  :class="[
                    'cursor-pointer transition-all',
                    selectedFacilityIds.includes(facility.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  ]"
                  @click="toggleFacility(facility.id)"
                >
                  <CardContent class="p-3 flex items-center gap-2">
                    <div
                      :class="[
                        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                        selectedFacilityIds.includes(facility.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      ]"
                    >
                      <Check
                        v-if="selectedFacilityIds.includes(facility.id)"
                        class="h-2.5 w-2.5 text-primary-foreground"
                      />
                    </div>
                    <span class="font-medium text-sm leading-tight truncate">{{ facility.name }}</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" @click="navigate('/')">
                取消
              </Button>
              <Button type="button" @click="handleSave" :disabled="saving">
                <Save class="mr-2 h-4 w-4" />
                {{ saving ? '儲存中...' : '儲存' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Save, Check, Settings, Search, X, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Layout from '@/user/layouts/OwnerLayout.vue'
import Button from '@/user/components/ui/Button.vue'
import Card from '@/user/components/ui/Card.vue'
import CardContent from '@/user/components/ui/CardContent.vue'
import CardHeader from '@/user/components/ui/CardHeader.vue'
import CardTitle from '@/user/components/ui/CardTitle.vue'
import CardDescription from '@/user/components/ui/CardDescription.vue'
import Input from '@/user/components/ui/Input.vue'
import { facilityAPI, hotelFacilityAPI } from '@/user/api/facility'
import { hotelAPI } from '@/user/api/hotel'
// 已移除 auth 驗證

const router = useRouter()
const route = useRoute()
const hotelId = parseInt(route.params.hotelId)
const userId = null // 不再需要用戶 ID 驗證

const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const facilities = ref([])
const selectedFacilityIds = ref([])
const hotelName = ref('')
const searchQuery = ref('') // 搜尋關鍵字
const filterMode = ref('all') // 篩選模式：'all', 'selected', 'unselected'
const expandedCategories = ref({}) // 分類展開狀態

// 修改：在前端定義設施分類映射（根據設施名稱）
const facilityCategoryMap = {
  // 房間設施
  '房間設施': ['空調', '電視', '冰箱', 'WiFi', '無線網路', '保險箱', '吹風機', '熱水壺', '免費盥洗用品', '迷你吧', '書桌', '沙發', '衣櫃', '窗戶', '陽台', '浴缸', '淋浴', '免治馬桶'],
  // 公共設施
  '公共設施': ['游泳池', '健身房', '停車場', '餐廳', '酒吧', '會議室', '商務中心', 'SPA', '桑拿', '蒸氣室', '三溫暖', '圖書館', '遊戲室', '兒童遊樂區', '花園', '露台', '燒烤區'],
  // 服務設施
  '服務設施': ['24小時櫃台', '行李寄存', '洗衣服務', '機場接駁', '租車服務', '旅遊諮詢', '外幣兌換', '郵政服務', '代客泊車', '接駁服務', '叫車服務', '快遞服務'],
  // 其他設施
  '其他設施': []
}

// 修改：根據設施名稱獲取分類
const getFacilityCategory = (facilityName) => {
  for (const [category, names] of Object.entries(facilityCategoryMap)) {
    if (names.includes(facilityName)) {
      return category
    }
  }
  return '其他設施'
}

// 修改：過濾設施（根據搜尋和篩選模式）
const filteredFacilities = computed(() => {
  let result = facilities.value

  // 搜尋過濾
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter(facility => 
      facility.name.toLowerCase().includes(query)
    )
  }

  // 篩選模式過濾
  if (filterMode.value === 'selected') {
    result = result.filter(facility => selectedFacilityIds.value.includes(facility.id))
  } else if (filterMode.value === 'unselected') {
    result = result.filter(facility => !selectedFacilityIds.value.includes(facility.id))
  }

  return result
})

// 修改：按分類分組設施（使用過濾後的設施）
const groupedFacilities = computed(() => {
  const groups = {}
  filteredFacilities.value.forEach(facility => {
    const category = getFacilityCategory(facility.name)
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(facility)
  })
  
  // 定義分類顯示順序
  const categoryOrder = ['房間設施', '公共設施', '服務設施', '其他設施']
  const orderedGroups = {}
  
  // 先按順序添加有定義的分類
  categoryOrder.forEach(cat => {
    if (groups[cat] && groups[cat].length > 0) {
      orderedGroups[cat] = groups[cat]
    }
  })
  
  // 再添加其他未定義的分類
  Object.keys(groups).forEach(cat => {
    if (!categoryOrder.includes(cat) && groups[cat].length > 0) {
      orderedGroups[cat] = groups[cat]
    }
  })
  
  return orderedGroups
})

// 過濾後的分組設施（用於顯示）
const filteredGroupedFacilities = computed(() => {
  return groupedFacilities.value
})

onMounted(async () => {
  await fetchHotel()
  await fetchFacilities()
  // 等待設施列表載入完成後再載入已選設施
  await fetchHotelFacilities()
  // 設施載入完成後，初始化分類展開狀態
  Object.keys(groupedFacilities.value).forEach(category => {
    expandedCategories.value[category] = true
  })
})

const fetchHotel = async () => {
  try {
    // 使用業者專用 API，可以查看停業中的飯店
    const data = await hotelAPI.getHotelForOwner(hotelId)
    hotelName.value = data.name
  } catch (error) {
    toast.error('載入飯店資料失敗：' + error.message)
    router.push('/')
  }
}

const fetchFacilities = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await facilityAPI.getAllFacilities()
    facilities.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('載入設施列表失敗：', error)
    error.value = '載入設施列表失敗：' + error.message
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const fetchHotelFacilities = async () => {
  try {
    // 先嘗試從飯店資料中獲取設施 ID
    const hotelData = await hotelAPI.getHotelForOwner(hotelId)
    if (hotelData && Array.isArray(hotelData.facilityIds)) {
      selectedFacilityIds.value = hotelData.facilityIds
      console.log('從飯店資料載入設施 ID:', selectedFacilityIds.value)
      return
    }
    
    // 如果飯店資料中沒有，嘗試使用專用 API
    const data = await hotelFacilityAPI.getHotelFacilities(hotelId)
    // 如果返回的是陣列，直接使用；如果是物件，嘗試取得 facilityIds
    if (Array.isArray(data)) {
      selectedFacilityIds.value = data
      console.log('從 API 載入設施 ID:', selectedFacilityIds.value)
    } else if (data && Array.isArray(data.facilityIds)) {
      selectedFacilityIds.value = data.facilityIds
      console.log('從 API 物件載入設施 ID:', selectedFacilityIds.value)
    } else {
      selectedFacilityIds.value = []
      console.log('未找到設施 ID，設為空陣列')
    }
  } catch (error) {
    console.error('載入飯店設施失敗：', error)
    // 如果端點不存在或失敗，設為空陣列
    selectedFacilityIds.value = []
  }
}

const toggleFacility = (facilityId) => {
  const index = selectedFacilityIds.value.indexOf(facilityId)
  if (index > -1) {
    selectedFacilityIds.value.splice(index, 1)
  } else {
    selectedFacilityIds.value.push(facilityId)
  }
}

/**
 * 切換分類展開/摺疊狀態
 */
const toggleCategory = (category) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

/**
 * 檢查分類中的所有設施是否都已選中
 */
const isCategoryAllSelected = (categoryFacilities) => {
  if (categoryFacilities.length === 0) return false
  return categoryFacilities.every(facility => selectedFacilityIds.value.includes(facility.id))
}

/**
 * 切換分類的所有設施選擇狀態
 */
const toggleCategorySelection = (category, categoryFacilities) => {
  const allSelected = isCategoryAllSelected(categoryFacilities)
  
  if (allSelected) {
    // 取消全選：移除該分類中所有設施
    categoryFacilities.forEach(facility => {
      const index = selectedFacilityIds.value.indexOf(facility.id)
      if (index > -1) {
        selectedFacilityIds.value.splice(index, 1)
      }
    })
  } else {
    // 全選：添加該分類中所有未選的設施
    categoryFacilities.forEach(facility => {
      if (!selectedFacilityIds.value.includes(facility.id)) {
        selectedFacilityIds.value.push(facility.id)
      }
    })
  }
}

/**
 * 獲取分類中已選設施的數量
 */
const getSelectedCountInCategory = (categoryFacilities) => {
  return categoryFacilities.filter(facility => selectedFacilityIds.value.includes(facility.id)).length
}

const handleSave = async () => {
  saving.value = true
  try {
    await hotelFacilityAPI.updateHotelFacilities(hotelId, selectedFacilityIds.value)
    toast.success('設施已更新')
    
    // 檢查是否是從引導式新增頁面跳轉過來的
    const fromSetup = route.query.from === 'setup'
    const step = route.query.step || '4'
    
    if (fromSetup) {
      // 跳轉回引導式新增頁面，並傳遞 hotelId 和步驟
      router.push(`/hotels/${hotelId}/setup?step=${step}`)
    } else {
      // 否則跳轉回飯店列表
      router.push('/')
    }
  } catch (error) {
    toast.error('儲存失敗：' + error.message)
    console.error('儲存設施失敗：', error)
  } finally {
    saving.value = false
  }
}

const navigate = (path) => {
  router.push(path)
}

// 處理返回按鈕點擊
const handleBack = () => {
  // 檢查是否是從引導式新增頁面跳轉過來的
  const fromSetup = route.query.from === 'setup'
  const step = route.query.step || '4'
  
  if (fromSetup && hotelId) {
    navigate(`/hotels/${hotelId}/setup?step=${step}`)
  } else {
    navigate('/')
  }
}
</script>
