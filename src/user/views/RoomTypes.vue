<template>
  <Layout>
    <div class="px-8 pt-4 pb-8">
      <Button variant="ghost" @click="handleBack" class="mb-4">
        <ArrowLeft class="mr-2 h-4 w-4" />
        返回
      </Button>

      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Bed class="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-foreground">房型管理</h1>
                <p class="mt-1 text-muted-foreground">{{ hotelName ? `管理「${hotelName}」的房型` : '管理房型資訊' }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-start">
          <Button @click="handleNewRoomType">
            <Plus class="mr-2 h-4 w-4" />
            新增房型
          </Button>
        </div>
      </div>

      <div v-if="loading" class="flex h-full items-center justify-center py-16">
        <div class="text-muted-foreground">載入中...</div>
      </div>

      <Card v-else-if="rooms.length === 0" class="shadow-soft">
        <CardContent class="flex flex-col items-center justify-center py-16">
          <div class="mb-4 text-6xl">🛏️</div>
          <h3 class="mb-2 text-xl font-semibold">還沒有房型</h3>
          <p class="mb-6 text-muted-foreground">開始新增您的第一個房型吧！</p>
          <Button @click="handleNewRoomType">
            <Plus class="mr-2 h-4 w-4" />
            新增房型
          </Button>
        </CardContent>
      </Card>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="room in rooms"
          :key="room.id"
          class="shadow-soft transition-shadow hover:shadow-medium"
        >
          <CardHeader>
            <div class="flex items-start justify-between">
              <div>
                <CardTitle class="text-xl">{{ room.name }}</CardTitle>
                <div class="mt-2 flex gap-2">
                  <Badge :variant="room.status === 1 ? 'default' : 'destructive'">
                    {{ room.status === 1 ? '啟用' : '停用' }}
                  </Badge>
                  <Badge variant="secondary" v-if="room.roomTypeBedTypeId">
                    配置 ID: {{ room.roomTypeBedTypeId }}
                  </Badge>
                </div>
              </div>
            </div>
            <CardDescription v-if="room.description" class="mt-2 line-clamp-2">
              {{ room.description }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">房間數量：</span>
                <span class="font-medium">{{ room.quantity || 0 }}</span>
              </div>
              <div class="flex items-center justify-between" v-if="room.maxOccupancy">
                <span class="text-muted-foreground">最多入住人數：</span>
                <span class="font-medium">{{ room.maxOccupancy }} 人</span>
              </div>
              <div class="flex items-center justify-between" v-if="room.size">
                <span class="text-muted-foreground">房間大小：</span>
                <span class="font-medium">{{ room.size }} 平方公尺</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">基本價格：</span>
                <span class="font-medium text-lg">NT$ {{ formatPrice(room.basePrice) }}</span>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="handleEdit(room.id)"
              >
                <Edit class="mr-2 h-4 w-4" />
                編輯
              </Button>
              <Button
                variant="destructive"
                size="sm"
                @click="handleDelete(room.id)"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                刪除
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Plus, Edit, Trash2, Bed } from 'lucide-vue-next'
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
import { hotelAPI } from '@/user/api/hotel'
// 已移除 auth 驗證

const router = useRouter()
const route = useRoute()
const hotelId = parseInt(route.params.hotelId)
const userId = null // 不再需要用戶 ID 驗證

const rooms = ref([])
const loading = ref(true)
const hotelName = ref('')

onMounted(() => {
  fetchHotelInfo()
  fetchRooms()
})

const fetchHotelInfo = async () => {
  try {
    const hotel = await hotelAPI.getHotelForOwner(hotelId)
    hotelName.value = hotel.name || ''
  } catch (error) {
    console.error('載入飯店資訊失敗：', error)
  }
}

const fetchRooms = async () => {
  try {
    loading.value = true
    // 使用後台專用API，可以查看停業飯店的房型
    const data = await roomAPI.getRoomsByHotelIdForOwner(hotelId)
    rooms.value = data || []
  } catch (error) {
    toast.error('載入房型列表失敗：' + error.message)
    rooms.value = []
  } finally {
    loading.value = false
  }
}

const handleDelete = async (roomId) => {
  if (!confirm('確定要刪除此房型嗎？')) return

  try {
    await roomAPI.deleteRoom(roomId)
    toast.success('房型已刪除')
    fetchRooms()
  } catch (error) {
    toast.error('刪除失敗：' + error.message)
  }
}

const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('zh-TW').format(price)
}

const navigate = (path) => {
  router.push(path)
}

// 處理新增房型按鈕點擊
const handleNewRoomType = () => {
  // 檢查是否是從引導式新增頁面跳轉過來的
  const fromSetup = route.query.from === 'setup'
  const step = route.query.step || '2'
  
  if (fromSetup) {
    navigate(`/hotels/${hotelId}/room-types/new?from=setup&step=${step}`)
  } else {
    navigate(`/hotels/${hotelId}/room-types/new`)
  }
}

// 處理返回按鈕點擊
const handleBack = () => {
  // 檢查是否是從引導式新增頁面跳轉過來的
  const fromSetup = route.query.from === 'setup'
  const step = route.query.step || '2'
  
  if (fromSetup) {
    navigate(`/hotels/${hotelId}/setup?step=${step}`)
  } else {
    navigate('/')
  }
}

// 處理編輯按鈕點擊
const handleEdit = (roomId) => {
  // 檢查是否是從引導式新增頁面跳轉過來的
  const fromSetup = route.query.from === 'setup'
  const step = route.query.step || '2'
  
  if (fromSetup) {
    navigate(`/hotels/${hotelId}/room-types/${roomId}?from=setup&step=${step}`)
  } else {
    navigate(`/hotels/${hotelId}/room-types/${roomId}`)
  }
}
</script>
