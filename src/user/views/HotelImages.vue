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
              <Image class="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-foreground">照片管理</h1>
              <p class="mt-1 text-muted-foreground">{{ hotelName ? `管理「${hotelName}」的照片` : '管理照片資訊' }}</p>
              <!-- 顯示飯店營業狀態（如果不在引導式新增流程中） -->
              <div v-if="hotelName && !isFromSetup" class="mt-2">
                <Badge :variant="hotelBusinessStatus ? 'default' : 'destructive'">
                  {{ hotelBusinessStatus ? '營業中' : '停業中' }}
                </Badge>
                <span v-if="!hotelBusinessStatus" class="ml-2 text-sm text-muted-foreground">
                  （停業中的飯店仍可編輯照片）
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card class="shadow-soft">
        <CardHeader>
          <CardTitle class="text-2xl">上傳與管理照片</CardTitle>
          <CardDescription>
            上傳飯店照片、設定封面照片、調整顯示順序（支援 JPG、PNG、WEBP 格式，每張最大 5MB）
            <br />
            <span class="font-semibold text-primary">注意：房東至少需要上傳 3 張照片</span>
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- 修改：改進上傳區域，讓它更明顯易用，支援拖放上傳 -->
          <div class="space-y-2">
            <Label html-for="images" class="text-base font-semibold">上傳照片</Label>
            <div 
              class="border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer"
              :class="[
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              ]"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <div class="flex flex-col items-center justify-center space-y-4">
                <div class="flex flex-col items-center space-y-2">
                  <Upload class="h-10 w-10 text-muted-foreground" />
                  <div class="text-center">
                    <p class="text-sm font-medium text-foreground">
                      點擊選擇照片或拖放照片到此處
                    </p>
                    <p class="text-sm text-muted-foreground mt-1">
                      支援 JPG、PNG、WEBP 格式，每張最大 5MB，可一次選擇多張
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <input
                    id="images"
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    @change="handleFileSelect"
                    :disabled="uploading"
                    class="hidden"
                  />
                  <Button 
                    @click.stop="triggerFileInput" 
                    :disabled="uploading" 
                    variant="default"
                    size="lg"
                  >
                    <Upload class="mr-2 h-4 w-4" />
                    {{ uploading ? '上傳中...' : '選擇照片' }}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 照片數量提示 -->
          <div v-if="images.length > 0 && images.length < 3" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p class="font-semibold">提醒：目前只有 {{ images.length }} 張照片，至少需要 3 張照片</p>
            </div>
          </div>

          <div v-if="images.length === 0 && !loading" class="text-center py-12 text-muted-foreground">
            <Upload class="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>尚未上傳任何照片</p>
            <p class="mt-2 text-sm font-semibold text-primary">請至少上傳 3 張照片</p>
          </div>

          <div v-else-if="loading" class="text-center py-12 text-muted-foreground">
            <p>載入中...</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              v-for="(image, index) in images"
              :key="image.id"
              class="relative overflow-hidden"
            >
              <div class="aspect-video relative">
                <img
                  :src="`${path}?photoUrl=${image.url}`"
                  :alt="`飯店照片 ${index + 1}`"
                  class="w-full h-full object-cover"
                  :style="image.isCover ? { objectPosition: cropPositionsMap[image.id] || getCropPosition(image.id) || 'center center' } : {}"
                />
                <div
                  v-if="image.isCover"
                  class="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                >
                  <Star class="h-3 w-3 fill-current" />
                  封面
                </div>
              </div>
              <CardContent class="p-4 space-y-3">
                <div class="flex gap-3">
                  <Button
                    v-if="!image.isCover"
                    size="sm"
                    variant="outline"
                    @click="handleSetCover(image.id)"
                    :disabled="loading"
                    class="flex-1"
                  >
                    <Star class="mr-1.5 h-3.5 w-3.5" />
                    設為封面
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    @click="handleDelete(image)"
                    :disabled="loading || images.length <= 3"
                    :title="images.length <= 3 ? '至少需要保留 3 張照片' : '刪除照片'"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <!-- 封面照片調整位置選項（可展開/收起） -->
                <div v-if="image.isCover" class="border-t pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="coverExpanded[image.id] = !coverExpanded[image.id]"
                    class="w-full justify-between text-sm text-muted-foreground hover:text-foreground"
                  >
                    <span>調整封面顯示位置</span>
                    <ChevronDown 
                      v-if="!coverExpanded[image.id]" 
                      class="h-4 w-4 transition-transform" 
                    />
                    <ChevronUp 
                      v-else 
                      class="h-4 w-4 transition-transform" 
                    />
                  </Button>
                  
                  <div v-show="coverExpanded[image.id]" class="space-y-3 mt-3">
                    <Label class="text-sm text-muted-foreground">拖曳調整封面顯示位置</Label>
                    <div 
                      :data-crop-container="image.id"
                      class="relative bg-muted rounded-lg overflow-hidden" 
                      style="aspect-ratio: 16 / 9;"
                    >
                      <!-- 預覽圖片 -->
                      <img
                        :src="`${path}?photoUrl=${image.url}`"
                        :alt="`封面預覽`"
                        class="w-full h-full object-cover"
                        :style="{ objectPosition: cropPositionsMap[image.id] || getCropPosition(image.id) || 'center center' }"
                      />
                      <!-- 可拖曳的指示器 -->
                      <div
                        class="absolute w-4 h-4 bg-primary border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
                        :style="getIndicatorPosition(image.id)"
                        @mousedown.stop="startDrag($event, image.id)"
                        @touchstart.stop="startDrag($event, image.id)"
                      >
                        <div class="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                      </div>
                      <!-- 網格線（可選，幫助對齊） -->
                      <div class="absolute inset-0 pointer-events-none">
                        <div class="absolute top-1/2 left-0 right-0 h-px bg-white/30"></div>
                        <div class="absolute left-1/2 top-0 bottom-0 w-px bg-white/30"></div>
                      </div>
                    </div>
                    <p class="text-sm text-muted-foreground text-center">
                      在預覽圖上拖曳圓點來調整顯示位置
                    </p>
                  </div>
                </div>
                
                <div class="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="handleMoveOrder(image, 'up')"
                    :disabled="loading || index === 0"
                    class="flex-1"
                  >
                    <MoveUp class="mr-1.5 h-3.5 w-3.5" />
                    上移
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="handleMoveOrder(image, 'down')"
                    :disabled="loading || index === images.length - 1"
                    class="flex-1"
                  >
                    <MoveDown class="mr-1.5 h-3.5 w-3.5" />
                    下移
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Upload, Star, Trash2, MoveUp, MoveDown, Image, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Layout from '@/user/layouts/OwnerLayout.vue'
import Button from '@/user/components/ui/Button.vue'
import Input from '@/user/components/ui/Input.vue'
import Label from '@/user/components/ui/Label.vue'
import Badge from '@/user/components/ui/Badge.vue'
import Card from '@/user/components/ui/Card.vue'
import CardContent from '@/user/components/ui/CardContent.vue'
import CardHeader from '@/user/components/ui/CardHeader.vue'
import CardTitle from '@/user/components/ui/CardTitle.vue'
import CardDescription from '@/user/components/ui/CardDescription.vue'
import { photoAPI } from '@/user/api/photo'
import { hotelAPI } from '@/user/api/hotel'
import { getCropPosition, setCropPosition } from '@/user/utils/photoCrop'
import { apiUpload, API_BASE_URL } from '@/user/api/request'

const router = useRouter()
const route = useRoute()
// 修改：路由參數是 :id，不是 :hotelId，並添加驗證
const hotelIdParam = route.params.id || route.params.hotelId
const hotelId = hotelIdParam ? parseInt(hotelIdParam) : null

// 驗證 hotelId 是否有效
if (!hotelId || isNaN(hotelId)) {
  console.error('無效的飯店 ID:', hotelIdParam)
  router.push('/')
}

const loading = ref(false)
const uploading = ref(false)
const images = ref([])
const hotelName = ref('')
const hotelBusinessStatus = ref(true) // 飯店營業狀態
const fileInput = ref(null)
const isDragging = ref(false) // 修改：追蹤拖放狀態
const cropPositionsMap = ref({}) // 存儲每個照片的裁剪位置，用於響應式更新
const draggingPhotoId = ref(null) // 當前正在拖曳的照片 ID
const dragStartPos = ref({ x: 0, y: 0 }) // 拖曳開始位置
const isFromSetup = ref(false) // 是否從引導式新增流程進入
const coverExpanded = ref({}) // 存儲每個封面照片的展開狀態

// 獲取照片的裁剪位置（帶響應式）
const getPhotoCropPosition = (photoId) => {
  if (!photoId) return 'center center'
  return cropPositionsMap.value[photoId] || getCropPosition(photoId) || 'center center'
}

/**
 * 將 object-position 字符串轉換為百分比位置
 * @param {string} position - CSS object-position 值（如 "center center", "20% 30%"）
 * @returns {Object} { x: number, y: number } 百分比值 (0-100)
 */
const parseObjectPosition = (position) => {
  if (!position) return { x: 50, y: 50 }
  
  // 處理常見的關鍵字
  const keywords = {
    'left': 0,
    'center': 50,
    'right': 100,
    'top': 0,
    'bottom': 100
  }
  
  const parts = position.trim().split(/\s+/)
  let x = 50, y = 50
  
  if (parts.length >= 1) {
    const xVal = parts[0]
    if (keywords.hasOwnProperty(xVal)) {
      x = keywords[xVal]
    } else if (xVal.includes('%')) {
      x = parseFloat(xVal)
    }
  }
  
  if (parts.length >= 2) {
    const yVal = parts[1]
    if (keywords.hasOwnProperty(yVal)) {
      y = keywords[yVal]
    } else if (yVal.includes('%')) {
      y = parseFloat(yVal)
    }
  }
  
  return { x, y }
}

/**
 * 將百分比位置轉換為 object-position 字符串
 * @param {number} x - X 軸百分比 (0-100)
 * @param {number} y - Y 軸百分比 (0-100)
 * @returns {string} CSS object-position 值
 */
const formatObjectPosition = (x, y) => {
  // 如果接近標準位置，使用關鍵字
  const snapThreshold = 5
  
  let xStr = `${x}%`
  if (Math.abs(x - 0) < snapThreshold) xStr = 'left'
  else if (Math.abs(x - 50) < snapThreshold) xStr = 'center'
  else if (Math.abs(x - 100) < snapThreshold) xStr = 'right'
  
  let yStr = `${y}%`
  if (Math.abs(y - 0) < snapThreshold) yStr = 'top'
  else if (Math.abs(y - 50) < snapThreshold) yStr = 'center'
  else if (Math.abs(y - 100) < snapThreshold) yStr = 'bottom'
  
  return `${xStr} ${yStr}`
}

/**
 * 獲取指示器的位置樣式
 * @param {number} photoId - 照片 ID
 * @returns {Object} CSS 樣式對象
 */
const getIndicatorPosition = (photoId) => {
  const position = getPhotoCropPosition(photoId)
  const { x, y } = parseObjectPosition(position)
  
  return {
    left: `${x}%`,
    top: `${y}%`
  }
}

onMounted(() => {
  // 檢查是否是從引導式新增流程進入
  isFromSetup.value = route.query.from === 'setup'
  
  if (hotelId && !isNaN(hotelId)) {
    fetchHotel()
    fetchImages()
  }
})

onUnmounted(() => {
  // 清理拖曳事件監聽器
  if (draggingPhotoId.value) {
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', handleDrag)
    document.removeEventListener('touchend', stopDrag)
  }
})

const fetchHotel = async () => {
  try {
    // 使用業者專用 API，可以查看停業中的飯店
    const data = await hotelAPI.getHotelForOwner(hotelId)
    hotelName.value = data.name || ''
    // 獲取飯店營業狀態（用於顯示，但不影響編輯功能）
    hotelBusinessStatus.value = data.businessStatus === true || data.businessStatus === 1
  } catch (error) {
    toast.error('載入飯店資料失敗：' + error.message)
    router.push('/')
  }
}

const fetchImages = async () => {
  try {
    loading.value = true
    const data = await photoAPI.getPhotosByHotelId(hotelId)
    images.value = data || []
    
    // 載入每個照片的裁剪位置到響應式 map 中
    if (images.value.length > 0) {
      images.value.forEach(image => {
        const position = getCropPosition(image.id)
        if (position) {
          cropPositionsMap.value[image.id] = position
        }
      })
    }
  } catch (error) {
    toast.error('載入照片失敗：' + error.message)
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// 修改：處理拖放上傳
const handleDrop = async (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (!files || files.length === 0) return
  
  // 創建一個模擬的 event 對象，以便重用 handleFileSelect 邏輯
  const fakeEvent = {
    target: {
      files: files
    }
  }
  await handleFileSelect(fakeEvent)
}

const handleFileSelect = async (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  uploading.value = true
  try {
    const photoDataList = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 驗證檔案大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`檔案 ${file.name} 超過 5MB 限制`)
        continue
      }

      // 驗證檔案類型
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error(`檔案 ${file.name} 格式不支援`)
        continue
      }

      // 上傳圖片到後端伺服器
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const uploadResult = await apiUpload('/upload/image', formData)
        
        // 修改：驗證響應格式和 URL 是否存在
        if (!uploadResult || typeof uploadResult !== 'object') {
          toast.error(`檔案 ${file.name} 上傳成功但返回格式錯誤`)
          console.error('上傳返回格式錯誤：', uploadResult)
          continue
        }
        
        const imageUrl = uploadResult.url || null
        
        // 修改：驗證 URL 是否存在
        if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.trim() === '')) {
          toast.error(`檔案 ${file.name} 上傳成功但未返回有效的 URL`)
          console.error('上傳返回的 URL 為空：', uploadResult)
          continue
        }
        
        // 修改：只存儲相對路徑，避免 URL 過長（資料庫限制 255 字元）
        // 如果是完整 URL，提取相對路徑部分
        let relativeUrl = imageUrl
        if (imageUrl.startsWith('http')) {
          // 如果是完整 URL，嘗試提取相對路徑
          try {
            const urlObj = new URL(imageUrl)
            relativeUrl = urlObj.pathname
          } catch (e) {
            // 如果解析失敗，使用原始 URL
            relativeUrl = imageUrl
          }
        }
        
        // 確保是相對路徑格式（以 / 開頭）
        if (!relativeUrl.startsWith('/')) {
          relativeUrl = '/' + relativeUrl
        }
        
        // 修改：驗證相對路徑長度（資料庫限制 255 字元）
        if (relativeUrl.length > 255) {
          toast.error(`檔案 ${file.name} 的 URL 路徑過長（超過 255 字元）`)
          console.error('URL 路徑過長：', relativeUrl)
          continue
        }
        
        photoDataList.push({
          url: relativeUrl, // 修改：只存儲相對路徑
          isCover: images.value.length === 0 && i === 0, // 第一張自動設為封面
          displayOrder: null, // 後端會自動計算
        })
      } catch (uploadError) {
        toast.error(`上傳 ${file.name} 失敗：${uploadError.message}`)
        console.error('上傳圖片失敗：', uploadError)
        continue
      }
    }

    if (photoDataList.length > 0) {
      // 修改：添加調試日誌，檢查發送的資料格式
      console.log('準備創建照片，資料：', {
        hotelId,
        photoCount: photoDataList.length,
        photos: photoDataList
      })
      
      try {
        await photoAPI.createPhotos(hotelId, photoDataList)
        toast.success(`已上傳 ${photoDataList.length} 張照片`)
        
        // 重新載入照片列表
        await fetchImages()
        
        // 檢查照片總數是否達到要求
        if (images.value.length < 3) {
          toast.warning(`目前共有 ${images.value.length} 張照片，至少需要 3 張照片`)
        } else if (images.value.length === 3) {
          toast.success('已達到最低要求：3 張照片')
        }
      } catch (error) {
        toast.error('創建照片記錄失敗：' + error.message)
        console.error('創建照片記錄失敗：', error)
        console.error('發送的資料：', photoDataList)
      }
    }
  } catch (error) {
    toast.error('上傳失敗：' + error.message)
    console.error('上傳照片失敗：', error)
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleSetCover = async (photoId) => {
  loading.value = true
  try {
    await photoAPI.setCoverPhoto(hotelId, photoId)
    toast.success('已設定為封面照片')
    // 自動展開封面調整區域
    coverExpanded.value[photoId] = true
    await fetchImages()
  } catch (error) {
    toast.error('設定失敗：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (image) => {
  // 檢查照片數量，至少需要保留 3 張
  if (images.value.length <= 3) {
    toast.error('至少需要保留 3 張照片，無法刪除')
    return
  }

  if (!confirm('確定要刪除這張照片嗎？')) return

  loading.value = true
  try {
    await photoAPI.deletePhoto(image.id)
    toast.success('已刪除照片')
    
    // 重新載入照片列表
    await fetchImages()
    
    // 檢查刪除後的數量
    if (images.value.length < 3) {
      toast.warning('目前照片數量少於 3 張，請至少上傳 3 張照片')
    }
  } catch (error) {
    toast.error('刪除失敗：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleMoveOrder = async (image, direction) => {
  const currentIndex = images.value.findIndex(img => img.id === image.id)
  if (
    (direction === 'up' && currentIndex === 0) ||
    (direction === 'down' && currentIndex === images.value.length - 1)
  ) {
    return
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  const targetImage = images.value[targetIndex]

  loading.value = true
  try {
    // 交換兩張照片的順序
    await Promise.all([
      photoAPI.updatePhotoOrder(image.id, targetImage.displayOrder),
      photoAPI.updatePhotoOrder(targetImage.id, image.displayOrder),
    ])
    toast.success('已調整順序')
    fetchImages()
  } catch (error) {
    toast.error('調整失敗：' + error.message)
  } finally {
    loading.value = false
  }
}

/**
 * 開始拖曳
 * @param {Event} event - 滑鼠或觸摸事件
 * @param {number} photoId - 照片 ID
 */
const startDrag = (event, photoId) => {
  event.preventDefault()
  event.stopPropagation()
  draggingPhotoId.value = photoId
  
  // 使用 data-crop-container 屬性找到容器
  let container = event.currentTarget.closest(`[data-crop-container="${photoId}"]`)
  
  // 如果找不到，嘗試從事件目標向上查找
  if (!container) {
    container = event.target.closest(`[data-crop-container="${photoId}"]`)
  }
  
  // 如果還是找不到，嘗試查找包含 relative 類的父元素
  if (!container) {
    container = event.currentTarget.closest('.relative')
  }
  
  if (!container) {
    console.error('無法找到拖曳容器，photoId:', photoId)
    return
  }
  
  const rect = container.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  
  dragStartPos.value = {
    x: clientX - rect.left,
    y: clientY - rect.top,
    rectX: rect.left,
    rectY: rect.top,
    rectWidth: rect.width,
    rectHeight: rect.height
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

/**
 * 處理拖曳
 * @param {Event} event - 滑鼠或觸摸事件
 */
const handleDrag = (event) => {
  if (!draggingPhotoId.value) return
  
  event.preventDefault()
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  
  const { rectX, rectY, rectWidth, rectHeight } = dragStartPos.value
  
  // 計算相對於容器的位置
  const x = ((clientX - rectX) / rectWidth) * 100
  const y = ((clientY - rectY) / rectHeight) * 100
  
  // 限制在 0-100% 範圍內
  const clampedX = Math.max(0, Math.min(100, x))
  const clampedY = Math.max(0, Math.min(100, y))
  
  // 轉換為 object-position 格式
  const position = formatObjectPosition(clampedX, clampedY)
  
  // 更新響應式 map（實時預覽）- 創建新對象以觸發響應式更新
  cropPositionsMap.value = {
    ...cropPositionsMap.value,
    [draggingPhotoId.value]: position
  }
}

/**
 * 停止拖曳
 */
const stopDrag = () => {
  if (!draggingPhotoId.value) return
  
  const photoId = draggingPhotoId.value
  const position = cropPositionsMap.value[photoId] || getPhotoCropPosition(photoId)
  
  // 保存到 localStorage
  setCropPosition(photoId, position)
  
  toast.success('已更新封面顯示位置')
  
  // 觸發事件通知其他頁面
  window.dispatchEvent(new CustomEvent('photoCropPositionUpdated', {
    detail: { photoId, cropPosition: position }
  }))
  
  draggingPhotoId.value = null
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
}

const navigate = (path) => {
  router.push(path)
}

// 處理返回按鈕點擊
const handleBack = () => {
  // 檢查是否是從引導式新增頁面跳轉過來的
  const fromSetup = route.query.from === 'setup'
  const step = route.query.step || '3'
  
  if (fromSetup && hotelId) {
    navigate(`/hotels/${hotelId}/setup?step=${step}`)
  } else {
    navigate('/')
  }
}

// 照片路徑
const path = import.meta.env.VITE_PHOTO_URL
</script>
