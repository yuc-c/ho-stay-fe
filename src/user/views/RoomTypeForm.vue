<template>
  <Layout>
    <div class="px-8 pt-4 pb-8">
      <Button variant="ghost" @click="handleBack" class="mb-4">
        <ArrowLeft class="mr-2 h-4 w-4" />
        返回
      </Button>

      <Card class="shadow-soft">
        <CardHeader>
          <CardTitle class="text-2xl">
            {{ isEdit ? '編輯房型' : '新增房型' }}
          </CardTitle>
          <CardDescription>
            填寫房型基本資訊
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-1.5 md:col-span-2">
                <Label html-for="name">房型名稱 *</Label>
                <Input
                  id="name"
                  v-model="formData.name"
                  required
                  placeholder="例如：海景101套房、行政套房"
                />
              </div>

              <!-- 修改：改為讓房東自己選擇房型分類、床型和數量 -->
              <div class="space-y-1.5">
                <Label html-for="roomTypeId">房型分類 *</Label>
                <Select
                  id="roomTypeId"
                  v-model="formData.roomTypeId"
                  required
                  :disabled="loadingTypes"
                >
                  <option value="">{{ loadingTypes ? '載入中...' : '選擇房型分類' }}</option>
                  <option
                    v-for="roomType in roomTypes"
                    :key="roomType.id"
                    :value="roomType.id"
                  >
                    {{ roomType.name }}
                  </option>
                </Select>
                <p v-if="!loadingTypes && roomTypes.length === 0" class="text-xs text-destructive">
                  沒有可用的房型分類，請先在資料庫中插入資料
                </p>
              </div>

              <div class="space-y-1.5">
                <Label html-for="bedTypeId">床型 *</Label>
                <Select
                  id="bedTypeId"
                  v-model="formData.bedTypeId"
                  required
                  :disabled="loadingTypes"
                >
                  <option value="">{{ loadingTypes ? '載入中...' : '選擇床型' }}</option>
                  <option
                    v-for="bedType in bedTypes"
                    :key="bedType.id"
                    :value="bedType.id"
                  >
                    {{ bedType.name }}
                  </option>
                </Select>
                <p v-if="!loadingTypes && bedTypes.length === 0" class="text-xs text-destructive">
                  沒有可用的床型，請先在資料庫中插入資料
                </p>
              </div>

              <div class="space-y-1.5">
                <Label html-for="bedNumber">床的數量 *</Label>
                <Input
                  id="bedNumber"
                  v-model.number="formData.bedNumber"
                  type="number"
                  min="1"
                  required
                  placeholder="例如：1 或 2"
                />
                <p class="text-xs text-muted-foreground">
                  例如：1 張雙人床 或 2 張單人床
                </p>
              </div>

              <div class="space-y-1.5">
                <Label html-for="quantity">房間數量 *</Label>
                <Input
                  id="quantity"
                  v-model.number="formData.quantity"
                  type="number"
                  min="1"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="maxOccupancy">最多入住人數</Label>
                <Input
                  id="maxOccupancy"
                  v-model.number="formData.maxOccupancy"
                  type="number"
                  min="1"
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="size">房間大小（平方公尺）</Label>
                <Input
                  id="size"
                  v-model.number="formData.size"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="basePrice">基本價格 *</Label>
                <Input
                  id="basePrice"
                  v-model.number="formData.basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div class="space-y-1.5 md:col-span-2">
                <Label html-for="description">房型描述</Label>
                <Textarea
                  id="description"
                  v-model="formData.description"
                  rows="2"
                  placeholder="描述房型的特色、設施等"
                />
              </div>

              <div class="flex items-center justify-between md:col-span-2">
                <div class="space-y-0.5">
                  <Label html-for="status">啟用狀態</Label>
                  <p class="text-sm text-muted-foreground">
                    停用時此房型將不會顯示
                  </p>
                </div>
                <Switch
                  id="status"
                  :checked="formData.status === 1"
                  @update:checked="(value) => formData.status = value ? 1 : 0"
                />
              </div>
            </div>

            <div class="flex justify-end gap-4">
              <Button type="button" variant="outline" @click="handleBack">
                取消
              </Button>
              <Button type="submit" :disabled="loading">
                <Save class="mr-2 h-4 w-4" />
                {{ loading ? '儲存中...' : '儲存' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Layout from '@/user/layouts/OwnerLayout.vue'
import Button from '@/user/components/ui/Button.vue'
import Input from '@/user/components/ui/Input.vue'
import Label from '@/user/components/ui/Label.vue'
import Textarea from '@/user/components/ui/Textarea.vue'
import Select from '@/user/components/ui/Select.vue'
import Switch from '@/user/components/ui/Switch.vue'
import Card from '@/user/components/ui/Card.vue'
import CardContent from '@/user/components/ui/CardContent.vue'
import CardHeader from '@/user/components/ui/CardHeader.vue'
import CardTitle from '@/user/components/ui/CardTitle.vue'
import CardDescription from '@/user/components/ui/CardDescription.vue'
import { roomAPI, roomTypeAPI, bedTypeAPI, roomTypeBedTypeAPI } from '@/user/api/room'
// 已移除 auth 驗證

const router = useRouter()
const route = useRoute()
const hotelId = parseInt(route.params.hotelId)
const roomTypeId = route.params.roomTypeId
const isEdit = !!roomTypeId
const userId = null // 不再需要用戶 ID 驗證

const loading = ref(false)
const loadingTypes = ref(false)
const roomTypes = ref([])
const bedTypes = ref([])

const formData = ref({
  name: '',
  roomTypeId: null,
  bedTypeId: null,
  bedNumber: 1,
  quantity: 1,
  maxOccupancy: null,
  size: null,
  basePrice: null,
  description: '',
  status: 1,
})

onMounted(() => {
  fetchRoomTypesAndBedTypes()
  if (isEdit) {
    fetchRoom()
  }
})

const fetchRoomTypesAndBedTypes = async () => {
  try {
    loadingTypes.value = true
    console.log('開始載入房型分類和床型列表...')
    
    const [roomTypesData, bedTypesData] = await Promise.all([
      roomTypeAPI.getAllRoomTypes(),
      bedTypeAPI.getAllBedTypes()
    ])
    
    console.log('房型分類資料：', roomTypesData)
    console.log('床型資料：', bedTypesData)
    
    roomTypes.value = Array.isArray(roomTypesData) ? roomTypesData : []
    bedTypes.value = Array.isArray(bedTypesData) ? bedTypesData : []
    
    if (roomTypes.value.length === 0) {
      console.warn('警告：沒有載入到任何房型分類資料')
      toast.warning('沒有可用的房型分類，請先在資料庫中插入資料')
    }
    if (bedTypes.value.length === 0) {
      console.warn('警告：沒有載入到任何床型資料')
      toast.warning('沒有可用的床型，請先在資料庫中插入資料')
    }
  } catch (error) {
    console.error('載入房型/床型列表失敗：', error)
    console.error('錯誤詳情：', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    toast.error('載入房型/床型列表失敗：' + error.message)
  } finally {
    loadingTypes.value = false
  }
}

const fetchRoom = async () => {
  try {
    loading.value = true
    const data = await roomAPI.getRoomById(roomTypeId)
    
    // 修改：直接使用返回的 roomTypeId、bedTypeId 和 bedNumber
    formData.value = {
      name: data.name || '',
      roomTypeId: data.roomTypeId || null,
      bedTypeId: data.bedTypeId || null,
      bedNumber: data.bedNumber || 1,
      quantity: data.quantity || 1,
      maxOccupancy: data.maxOccupancy || null,
      size: data.size || null,
      basePrice: data.basePrice ? parseFloat(data.basePrice) : null,
      description: data.description || '',
      status: data.status !== undefined ? data.status : 1,
    }
  } catch (error) {
    toast.error('載入房型資料失敗：' + error.message)
    router.push(`/hotels/${hotelId}/room-types`)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  // 驗證必填欄位
  if (!formData.value.name || !formData.value.roomTypeId || !formData.value.bedTypeId || !formData.value.basePrice) {
    toast.error('請填寫所有必填欄位')
    return
  }

  if (!formData.value.quantity || formData.value.quantity < 1) {
    toast.error('房間數量必須大於 0')
    return
  }

  if (!formData.value.bedNumber || formData.value.bedNumber < 1) {
    toast.error('床的數量必須大於 0')
    return
  }

  loading.value = true

  try {
    // 修改：發送 roomTypeId、bedTypeId 和 bedNumber，讓後端自動創建配置
    const roomData = {
      name: formData.value.name,
      roomTypeId: formData.value.roomTypeId,
      bedTypeId: formData.value.bedTypeId,
      bedNumber: formData.value.bedNumber,
      quantity: formData.value.quantity,
      maxOccupancy: formData.value.maxOccupancy || null,
      size: formData.value.size || null,
      basePrice: formData.value.basePrice,
      description: formData.value.description || null,
      status: formData.value.status,
    }

    if (isEdit) {
      await roomAPI.updateRoom(roomTypeId, roomData)
      toast.success('房型已更新')
    } else {
      await roomAPI.createRoom(hotelId, roomData)
      toast.success('房型已新增')
    }

    // 檢查是否是從引導式新增頁面跳轉過來的
    const fromSetup = route.query.from === 'setup'
    const step = route.query.step || '2'
    
    if (fromSetup) {
      // 跳轉回引導式新增頁面，並傳遞 hotelId 和步驟
      router.push(`/hotels/${hotelId}/setup?step=${step}`)
    } else {
      // 否則跳轉回房型管理頁面
      router.push(`/hotels/${hotelId}/room-types`)
    }
  } catch (error) {
    toast.error('儲存失敗：' + error.message)
    console.error('儲存房型失敗：', error)
  } finally {
    loading.value = false
  }
}

const navigate = (path) => {
  router.push(path)
}

// 處理返回按鈕點擊
const handleBack = () => {
  // 檢查是否是從引導式新增頁面跳轉過來的
  const fromSetup = route.query.from === 'setup'
  const step = route.query.step || '2'
  
  if (fromSetup) {
    navigate(`/hotels/${hotelId}/setup?step=${step}`)
  } else {
    navigate(`/hotels/${hotelId}/room-types`)
  }
}
</script>
