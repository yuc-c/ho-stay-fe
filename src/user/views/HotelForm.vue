<template>
  <Layout>
    <div class="px-8 pt-4 pb-8 flex flex-col items-center">
      <div class="w-full max-w-4xl">
        <Button variant="ghost" @click="navigate('/')" class="mb-4">
          <ArrowLeft class="mr-2 h-4 w-4" />
          返回飯店列表
        </Button>

        <Card class="shadow-soft">
          <CardHeader>
            <CardTitle class="text-2xl">
              {{ isEdit ? '編輯飯店' : '新增飯店' }}
            </CardTitle>
            <CardDescription>
              填寫飯店基本資訊，系統會自動將地址轉換為座標
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div class="space-y-1.5">
                <Label html-for="name">飯店名稱 *</Label>
                <Input
                  id="name"
                  v-model="formData.name"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="hotel_type">飯店類型 *</Label>
                <Select
                  id="hotel_type"
                  v-model="formData.hotel_type"
                  required
                  :disabled="loadingHotelTypes"
                >
                  <option value="">{{ loadingHotelTypes ? '載入中...' : '選擇飯店類型' }}</option>
                  <option
                    v-for="hotelType in hotelTypes"
                    :key="hotelType.id"
                    :value="hotelType.id.toString()"
                  >
                    {{ hotelType.type }}
                  </option>
                </Select>
              </div>

              <div class="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label html-for="description">飯店描述</Label>
                <Textarea
                  id="description"
                  v-model="formData.description"
                  rows="2"
                />
              </div>

              <!-- 城市和行政區選擇 -->
              <div class="space-y-1.5">
                <Label html-for="city">城市 *</Label>
                <Select
                  id="city"
                  v-model="formData.city"
                  required
                >
                  <option value="" disabled>請選擇城市</option>
                  <option
                    v-for="city in cities"
                    :key="city"
                    :value="city"
                  >
                    {{ city }}
                  </option>
                </Select>
              </div>

              <div class="space-y-1.5">
                <Label html-for="district">行政區 *</Label>
                <Select
                  id="district"
                  v-model="formData.district"
                  required
                  :disabled="!formData.city || loadingDistricts"
                >
                  <option value="" disabled>
                    {{ formData.city ? (loadingDistricts ? '載入中...' : '請選擇行政區') : '請先選擇城市' }}
                  </option>
                  <option
                    v-for="district in availableDistricts"
                    :key="district"
                    :value="district"
                  >
                    {{ district }}
                  </option>
                </Select>
              </div>

              <!-- 詳細地址輸入 -->
              <div class="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label>詳細地址 *</Label>
                <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p class="text-sm text-blue-800 font-medium">
                    ✨ 使用 Google Places Autocomplete 自動完成地址
                  </p>
                  <p class="text-xs text-blue-700 mt-1">
                    請輸入路名、巷弄、門牌號碼等詳細地址，系統會自動補全並獲取座標。
                  </p>
                </div>
                <HotelLocationPicker v-model="formData.location" />
              </div>

              <div class="space-y-1.5">
                <Label html-for="star_rating">星級</Label>
                <Select
                  id="star_rating"
                  v-model="formData.star_rating"
                >
                  <option value="">未評級</option>
                  <option value="1">1 星</option>
                  <option value="2">2 星</option>
                  <option value="3">3 星</option>
                  <option value="4">4 星</option>
                  <option value="5">5 星</option>
                </Select>
              </div>

              <div class="space-y-1.5">
                <Label html-for="license">執照號碼 *</Label>
                <Input
                  id="license"
                  v-model="formData.license"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="phone">手機</Label>
                <Input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  maxlength="10"
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="localCall">市話</Label>
                <Input
                  id="localCall"
                  v-model="formData.localCall"
                  type="tel"
                  maxlength="10"
                />
              </div>

              <div class="space-y-1.5">
                <Label html-for="check_in_time">入住時間</Label>
                <select
                  id="check_in_time"
                  v-model="formData.check_in_time"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="" disabled>
                    請選擇入住時間（未選則預設 15:00）
                  </option>
                  <option
                    v-for="time in timeOptions"
                    :key="time"
                    :value="time"
                  >
                    {{ time }}
                  </option>
                </select>
                <p class="text-xs text-muted-foreground">
                  若未填寫，系統將預設為 15:00
                </p>
              </div>

              <div class="space-y-1.5">
                <Label html-for="check_out_time">退房時間</Label>
                <select
                  id="check_out_time"
                  v-model="formData.check_out_time"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="" disabled>
                    請選擇退房時間（未選則預設 11:00）
                  </option>
                  <option
                    v-for="time in timeOptions"
                    :key="`out-${time}`"
                    :value="time"
                  >
                    {{ time }}
                  </option>
                </select>
                <p class="text-xs text-muted-foreground">
                  若未填寫，系統將預設為 11:00
                </p>
              </div>

              <!-- 營業狀態按鈕已移除，用戶只能在飯店列表頁面切換營業狀態 -->
            </div>

            <div class="flex justify-end gap-4">
              <Button type="button" variant="outline" @click="navigate('/')">
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
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
import { hotelAPI } from '@/user/api/hotel'
import { hotelTypeAPI } from '@/user/api/hotelType'
import { hotelTypeMap, hotelTypeReverseMap, getDistrictIdByName, getDistrictsByCityName } from '@/user/api/district'
// import { geocodeAPI } from '@/user/api/geocode'  // 已停用：前端已使用 Google Maps API
import HotelLocationPicker from '@/user/components/HotelLocationPicker.vue'

// 已移除 auth 驗證

const router = useRouter()
const route = useRoute()
const id = route.params.id
const isEdit = !!id

// 已移除 auth 驗證
const userId = null // 不再需要用戶 ID 驗證

const loading = ref(false)
// const geocoding = ref(false)  // 已停用：不再使用後端 geocoding API

// 飯店類型相關
const hotelTypes = ref([])
const loadingHotelTypes = ref(false)

// 地圖相關變數（舊的手動輸入方式使用）
const manualCoordinates = ref('') // 手動輸入座標或 Google Maps URL
const mapInstance = ref(null) // Leaflet 地圖實例
const mapMarker = ref(null) // 地圖標記
const enableMapPinUpdate = ref(true) // 是否啟用「移動圖釘更新地址」功能（類似 Booking.com）
const isUpdatingFromMap = ref(false) // 標記是否正在從地圖更新地址（避免循環更新）

const formData = ref({
  name: '',
  license: '', // 必填
  description: '',
  hotel_type: '', // 改為使用 ID（字符串格式）
  city: '',
  district: '',
  addressStreet: '',
  addressNumber: '',
  star_rating: '', // 星級 (1-5)
  phone: '',
  localCall: '', // 市話
  check_in_time: '',
  check_out_time: '',
  business_status: false, // 預設為 false，只能在飯店列表頁面切換營業狀態
  latitude: null,
  longitude: null,
  // Booking.com 風格的位置選擇器資料
  location: {
    address: '',
    latitude: null,
    longitude: null
  }
})

// 監聽位置選擇器的變化，同步到 formData 的座標
// 注意：城市和行政區現在由用戶手動選擇，不再從地址解析
watch(() => formData.value.location, (newLocation) => {
  if (newLocation && newLocation.latitude && newLocation.longitude) {
    formData.value.latitude = newLocation.latitude
    formData.value.longitude = newLocation.longitude
  }
}, { deep: true })

// 監聽城市變更，清空行政區並載入新的行政區列表
// 注意：在初始化時（isInitializing）不清空行政區，因為那是從後端載入的資料
watch(() => formData.value.city, (newCity, oldCity) => {
  if (newCity !== oldCity && !isInitializing.value) {
    // 城市變更時，清空行政區選擇（但不在初始化時清空）
    formData.value.district = ''
    // 載入新城市的行政區列表
    if (newCity) {
      loadDistrictsForCity(newCity)
    }
  }
})

const timeOptions = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const isInitializing = ref(false)

// 縣市列表（與資料庫中的名稱一致，使用「臺」）
const cities = [
  '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市',
  '基隆市', '新竹市', '嘉義市', '宜蘭縣', '新竹縣', '苗栗縣',
  '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '花蓮縣',
  '臺東縣', '澎湖縣', '金門縣', '連江縣'
]

// 動態載入的行政區資料（根據選擇的城市從後端 API 獲取）
const districtsByCity = ref({})
const loadingDistricts = ref(false)

// 根據城市獲取行政區列表
const availableDistricts = computed(() => {
  if (!formData.value.city) return []
  const districts = districtsByCity.value[formData.value.city]
  return districts ? districts.map(d => d.name) : []
})

// 從後端載入指定城市的行政區
const loadDistrictsForCity = async (cityName) => {
  if (!cityName) {
    return
  }

  // 如果已經載入過，直接返回
  if (districtsByCity.value[cityName]) {
    return
  }

  loadingDistricts.value = true
  try {
    const districts = await getDistrictsByCityName(cityName)
    districtsByCity.value[cityName] = districts
  } catch (error) {
    console.error(`載入城市 "${cityName}" 的行政區失敗：`, error)
    toast.error(`無法載入 ${cityName} 的行政區列表`)
  } finally {
    loadingDistricts.value = false
  }
}

// 清理道路欄位中重複的城市或行政區名稱
// 格式化座標，去除末尾的0
const formatCoordinate = (coord) => {
  if (typeof coord !== 'number') return coord
  // 先格式化成8位小數，然後 parseFloat 會自動去除末尾的0
  return parseFloat(coord.toFixed(8))
}

const cleanStreetAddress = (street, city, district) => {
  if (!street) return ''
  let cleaned = street.trim()
  
  // 去除城市名稱（處理「臺」和「台」的不同寫法）
  if (city) {
    // 標準化城市名稱（將「臺」轉換為「台」以便匹配）
    const normalizedCity = city.replace('臺', '台')
    const normalizedCleaned = cleaned.replace('臺', '台')
    
    // 移除完整的城市名稱（例如「台北市」或「臺北市」）
    const cityPatterns = [
      city, // 原始城市名稱
      normalizedCity, // 標準化城市名稱
      city.replace(/[市縣]$/, ''), // 不含後綴的城市名稱
      normalizedCity.replace(/[市縣]$/, '') // 不含後綴的標準化城市名稱
    ]
    
    for (const pattern of cityPatterns) {
      // 移除開頭的城市名稱
      const regex = new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')
      cleaned = cleaned.replace(regex, '')
      // 也檢查標準化後的地址
      const normalized = cleaned.replace('臺', '台')
      if (normalized !== cleaned) {
        cleaned = normalized.replace(regex, '').replace('台', '臺')
      }
    }
  }
  
  // 去除行政區名稱（只在開頭移除完整的行政區名稱，避免誤刪道路名稱中的詞彙）
  if (district) {
    // 只移除完整的行政區名稱（例如「內湖區」），並且只在開頭移除
    // 這樣可以避免「內湖路一段」中的「內湖」被誤刪
    const districtRegex = new RegExp(`^${district.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')
    cleaned = cleaned.replace(districtRegex, '')
  }
  
  // 移除地址中任何位置的重複城市名稱（例如：臺中市...台中市...）
  const cityNames = [
    '臺北市', '台北市', '新北市', '桃園市', '臺中市', '台中市',
    '臺南市', '台南市', '高雄市', '基隆市', '新竹市', '嘉義市',
    '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣',
    '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '台東縣', '澎湖縣', '金門縣', '連江縣'
  ]
  
  // 找出第一個城市名稱的位置
  let firstCityIndex = -1
  let firstCity = null
  for (const cityName of cityNames) {
    const index = cleaned.indexOf(cityName)
    if (index >= 0 && (firstCityIndex < 0 || index < firstCityIndex)) {
      firstCityIndex = index
      firstCity = cityName
    }
  }
  
  // 如果找到第一個城市，移除後面重複的城市名稱
  if (firstCity && firstCityIndex >= 0) {
    const cityEndIndex = firstCityIndex + firstCity.length
    for (const cityName of cityNames) {
      // 檢查是否與第一個城市對應（例如：臺中市和台中市）
      if (cityName !== firstCity && 
          (cityName.replace('臺', '台') === firstCity.replace('臺', '台'))) {
        const duplicateIndex = cleaned.indexOf(cityName, cityEndIndex)
        if (duplicateIndex > 0) {
          cleaned = cleaned.substring(0, duplicateIndex) + cleaned.substring(duplicateIndex + cityName.length)
          console.log('前端清理：移除重複的城市名稱', cityName)
        }
      }
    }
  }
  
  return cleaned.trim()
}

const addressPreview = computed(() => {
  // 使用清理後的地址進行預覽
  const cleanedStreet = cleanStreetAddress(
    formData.value.addressStreet,
    formData.value.city,
    formData.value.district
  )
  
  const parts = [
    formData.value.city || '',
    formData.value.district || '',
    cleanedStreet,
    formData.value.addressNumber || ''
  ]
  return parts.join('')
})

const cityLabel = computed(() => formData.value.city || '（城市）')
const districtLabel = computed(() => formData.value.district || '（行政區）')

const canGetCoordinates = computed(() => {
  // 檢查是否填寫完整地址（地理編碼使用後端 API，不需要前端 API Key）
  return !!(
    formData.value.city &&
    formData.value.district &&
    formData.value.addressStreet &&
    formData.value.addressNumber
  )
})

// 檢查必填資料是否完成（用於判斷是否可以營業）
const canOpenBusiness = computed(() => {
  // 基本必填欄位檢查
  const hasName = formData.value.name && formData.value.name.trim() !== ''
  const hasLicense = formData.value.license && formData.value.license.trim() !== ''
  const hasCity = formData.value.city && formData.value.city.trim() !== ''
  const hasDistrict = formData.value.district && formData.value.district.trim() !== ''
  
  // 檢查地址：優先使用位置選擇器，如果使用位置選擇器就不需要 addressStreet 和 addressNumber
  const hasLocationPickerData = formData.value.location?.address && 
                                 formData.value.location?.latitude != null && 
                                 formData.value.location?.longitude != null
  
  // 如果使用位置選擇器，不需要檢查 addressStreet 和 addressNumber
  // 如果沒有使用位置選擇器，才需要檢查 addressStreet 和 addressNumber
  const hasAddress = hasLocationPickerData || 
                     (formData.value.addressStreet && formData.value.addressStreet.trim() !== '' &&
                      formData.value.addressNumber && formData.value.addressNumber.trim() !== '')
  
  // 檢查座標：優先使用位置選擇器，否則使用舊的輸入方式
  const hasCoordinates = (formData.value.location?.latitude != null && formData.value.location?.longitude != null) ||
                         (formData.value.latitude != null && formData.value.longitude != null)
  const hasPhone = (formData.value.phone && formData.value.phone.trim() !== '') || 
                   (formData.value.localCall && formData.value.localCall.trim() !== '')
  
  return hasName && hasLicense && hasCity && hasDistrict && 
         hasAddress && hasCoordinates && hasPhone
})

// 獲取未完成的必填項目列表（用於提示）
const missingRequiredFields = computed(() => {
  const missing = []
  if (!formData.value.name || formData.value.name.trim() === '') {
    missing.push('飯店名稱')
  }
  if (!formData.value.license || formData.value.license.trim() === '') {
    missing.push('執照號碼')
  }
  if (!formData.value.city || formData.value.city.trim() === '') {
    missing.push('城市')
  }
  if (!formData.value.district || formData.value.district.trim() === '') {
    missing.push('行政區')
  }
  
  // 檢查地址：優先使用位置選擇器，如果使用位置選擇器就不需要 addressStreet 和 addressNumber
  const hasLocationPickerData = formData.value.location?.address && 
                                 formData.value.location?.latitude != null && 
                                 formData.value.location?.longitude != null
  
  if (!hasLocationPickerData) {
    // 如果沒有使用位置選擇器，才需要檢查 addressStreet 和 addressNumber
    if (!formData.value.addressStreet || formData.value.addressStreet.trim() === '') {
      missing.push('道路／街巷')
    }
    if (!formData.value.addressNumber || formData.value.addressNumber.trim() === '') {
      missing.push('門牌號碼')
    }
  }
  
  const hasCoordinates = (formData.value.location?.latitude != null && formData.value.location?.longitude != null) ||
                         (formData.value.latitude != null && formData.value.longitude != null)
  if (!hasCoordinates) {
    missing.push('地址位置（請使用上方的地址選擇器選擇地址）')
  }
  if ((!formData.value.phone || formData.value.phone.trim() === '') && 
      (!formData.value.localCall || formData.value.localCall.trim() === '')) {
    missing.push('聯絡電話（手機或市話至少填一個）')
  }
  return missing
})

// 處理營業狀態變更
const handleBusinessStatusChange = (value) => {
  if (value && !canOpenBusiness.value) {
    // 如果嘗試開啟營業狀態但必填資料未完成，阻止並提示
    toast.warning(`無法開啟營業狀態，請先完成以下必填項目：${missingRequiredFields.value.join('、')}`)
    return false
  }
  formData.value.business_status = value
  return true
}

const buildFullAddress = () => {
  // 清理道路欄位，去除重複的城市和行政區名稱
  const cleanedStreet = cleanStreetAddress(
    formData.value.addressStreet,
    formData.value.city,
    formData.value.district
  )
  
  // 構建完整地址，使用台灣地址格式（不使用逗號）
  // 格式：城市行政區道路門牌號碼（例如：新北市板橋區中山路一段100號）
  const parts = []
  
  // 添加城市（如果有）
  if (formData.value.city) {
    parts.push(formData.value.city)
  }
  
  // 添加行政區（如果有）
  if (formData.value.district) {
    parts.push(formData.value.district)
  }
  
  // 添加道路名稱（如果有）
  if (cleanedStreet) {
    parts.push(cleanedStreet)
  }
  
  // 添加門牌號碼（如果有）
  if (formData.value.addressNumber) {
    parts.push(formData.value.addressNumber)
  }
  
  // 使用空字串連接（台灣地址標準格式，不使用逗號）
  return parts.join('').trim()
}

const extractStreet = (fullAddress, districtName, cityName) => {
  if (!fullAddress) return ''
  let result = fullAddress
  if (cityName) result = result.replace(cityName, '')
  if (districtName) result = result.replace(districtName, '')
  result = result.trim()
  const match = result.match(/^(.*?)(\d.*)$/)
  if (match) {
    return match[1].trim()
  }
  return result.replace(/\d.*$/, '').trim()
}

const extractNumber = (fullAddress) => {
  if (!fullAddress) return ''
  const match = fullAddress.match(/(\d.*)$/)
  return match ? match[1].trim() : ''
}

watch(
  () => formData.value.city,
  async (newVal, oldVal) => {
    if (isInitializing.value) return
    if (newVal !== oldVal) {
      formData.value.district = ''
      formData.value.addressStreet = ''
      formData.value.addressNumber = ''
      formData.value.latitude = null
      formData.value.longitude = null
      
      // 載入新選擇城市的行政區
      if (newVal) {
        await loadDistrictsForCity(newVal)
      }
    }
  }
)

watch(
  () => formData.value.district,
  (newVal, oldVal) => {
    if (isInitializing.value) return
    if (newVal !== oldVal) {
      formData.value.addressStreet = ''
      formData.value.addressNumber = ''
      formData.value.latitude = null
      formData.value.longitude = null
    }
  }
)

/**
 * 反向地理編碼（座標轉地址）
 * 使用後端 API 進行反向地理編碼
 */
async function reverseGeocode(lat, lng) {
  try {
    // 使用後端 API 進行反向地理編碼
    // 注意：後端可能沒有反向地理編碼 API，這裡可以跳過或使用前端 Google Maps API
    // 暫時跳過反向地理編碼，只更新座標
    console.log('反向地理編碼（座標轉地址）:', { lat, lng })
    // TODO: 如果需要，可以實現後端反向地理編碼 API 或使用前端 Google Maps API
  } catch (error) {
    console.error('反向地理編碼失敗:', error)
  }
}

/**
 * 初始化互動式地圖（使用 Leaflet.js）
 */
const initInteractiveMap = async () => {
  // 動態載入 Leaflet CSS 和 JS
  if (!document.querySelector('link[href*="leaflet"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  if (typeof window.L === 'undefined') {
    await new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = resolve
      document.head.appendChild(script)
    })
  }

  await nextTick()

  const mapContainer = document.getElementById('interactive-map')
  if (!mapContainer || mapInstance.value) return

  // 初始化地圖（預設位置：台灣中心）
  const defaultLat = formData.value.latitude || 23.5
  const defaultLng = formData.value.longitude || 121.0

  mapInstance.value = window.L.map('interactive-map').setView([defaultLat, defaultLng], 13)

  // 添加 OpenStreetMap 圖層
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapInstance.value)

  // 添加標記（可拖動）
  if (formData.value.latitude && formData.value.longitude) {
    mapMarker.value = window.L.marker([formData.value.latitude, formData.value.longitude], {
      draggable: true
    }).addTo(mapInstance.value)

    // 當標記被拖動時，更新座標（如果啟用了「移動圖釘更新地址」）
    mapMarker.value.on('dragend', async (e) => {
      if (!enableMapPinUpdate.value) return
      
      const position = e.target.getLatLng()
      isUpdatingFromMap.value = true
      
      formData.value.latitude = position.lat
      formData.value.longitude = position.lng
      
      // 嘗試進行反向地理編碼（從座標獲取地址）
      await reverseGeocode(position.lat, position.lng)
      
      isUpdatingFromMap.value = false
      toast.success(`已更新座標：${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
    })
  }

  // 當點擊地圖時，移動標記到該位置（如果啟用了「移動圖釘更新地址」）
  mapInstance.value.on('click', async (e) => {
    if (!enableMapPinUpdate.value) return
    
    const { lat, lng } = e.latlng
    isUpdatingFromMap.value = true
    
    if (mapMarker.value) {
      mapMarker.value.setLatLng([lat, lng])
    } else {
      mapMarker.value = window.L.marker([lat, lng], {
        draggable: true
      }).addTo(mapInstance.value)
      
      mapMarker.value.on('dragend', async (e) => {
        if (!enableMapPinUpdate.value) return
        
        const position = e.target.getLatLng()
        isUpdatingFromMap.value = true
        
        formData.value.latitude = position.lat
        formData.value.longitude = position.lng
        
        await reverseGeocode(position.lat, position.lng)
        
        isUpdatingFromMap.value = false
        toast.success(`已更新座標：${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
      })
    }
    
    formData.value.latitude = lat
    formData.value.longitude = lng
    
    // 嘗試進行反向地理編碼（從座標獲取地址）
    await reverseGeocode(lat, lng)
    
    isUpdatingFromMap.value = false
    toast.success(`已選擇位置：${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  })
}

/**
 * 更新地圖標記位置
 */
const updateMapMarker = () => {
  if (!mapInstance.value || !formData.value.latitude || !formData.value.longitude) return

  if (mapMarker.value) {
    mapMarker.value.setLatLng([formData.value.latitude, formData.value.longitude])
    mapInstance.value.setView([formData.value.latitude, formData.value.longitude], 17)
  } else if (mapInstance.value) {
    mapMarker.value = window.L.marker([formData.value.latitude, formData.value.longitude], {
      draggable: true
    }).addTo(mapInstance.value)

    mapMarker.value.on('dragend', (e) => {
      const position = e.target.getLatLng()
      formData.value.latitude = position.lat
      formData.value.longitude = position.lng
      toast.success(`已更新座標：${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
    })

    mapInstance.value.setView([formData.value.latitude, formData.value.longitude], 17)
  }
}

/**
 * 在 Google Maps 中開啟位置
 */
const openGoogleMaps = () => {
  if (formData.value.latitude && formData.value.longitude) {
    const url = buildFullAddress.value
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildFullAddress.value)}`
      : `https://www.google.com/maps?q=${formData.value.latitude},${formData.value.longitude}`
    window.open(url, '_blank')
  }
}

// 監聽座標變化，更新地圖標記（當不是從地圖更新時）
watch([() => formData.value.latitude, () => formData.value.longitude], () => {
  if (formData.value.latitude && formData.value.longitude && mapInstance.value && !isUpdatingFromMap.value) {
    updateMapMarker()
  }
})

// 監聽「移動圖釘更新地址」選項的變化
watch(enableMapPinUpdate, (enabled) => {
  if (mapMarker.value) {
    mapMarker.value.draggable = enabled
  }
})

// 獲取飯店類型列表
const fetchHotelTypes = async () => {
  loadingHotelTypes.value = true
  try {
    const types = await hotelTypeAPI.getAllHotelTypes()
    hotelTypes.value = Array.isArray(types) ? types : []
  } catch (error) {
    console.error('載入飯店類型失敗:', error)
    toast.error('載入飯店類型失敗，請稍後再試')
    hotelTypes.value = []
  } finally {
    loadingHotelTypes.value = false
  }
}

onMounted(async () => {
  // 先載入飯店類型列表
  await fetchHotelTypes()
  
  if (isEdit) {
    await fetchHotel()
    // fetchHotel 中已經會載入行政區，這裡不需要重複載入
  }
})

const fetchHotel = async () => {
  loading.value = true
  try {
    console.log('開始載入飯店資料，ID:', id)
    const data = await hotelAPI.getHotelForOwner(id)
    console.log('載入的飯店資料：', data)
    
    // 轉換後端資料格式到前端表單格式
    // 注意：確保正確處理嵌套的 district 和 city 對象
    const district = data.district
    const city = district?.city
    const fullAddress = data.address || ''
    isInitializing.value = true
    
    // 先設置城市（但不設置行政區，等載入完成後再設置）
    const cityName = city?.name || ''
    const districtName = district?.name || ''
    
    formData.value = {
      name: data.name || '',
      license: data.license || '',
      description: data.description || '',
      hotel_type: data.hotelTypeId ? data.hotelTypeId.toString() : '',
      city: cityName,
      district: '', // 先不設置，等載入行政區列表後再設置
      addressStreet: extractStreet(fullAddress, district?.name, city?.name),
      addressNumber: extractNumber(fullAddress),
      star_rating: data.starRating ? String(data.starRating) : '',
      phone: data.phone || '',
      localCall: data.localCall || '',
      check_in_time: data.checkInTime ? data.checkInTime.slice(0, 5) : '',
      check_out_time: data.checkOutTime ? data.checkOutTime.slice(0, 5) : '',
      // 處理 businessStatus：可能是 boolean 或 number (1/0)
      business_status: data.businessStatus === true || data.businessStatus === 1,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      // Booking.com 風格的位置選擇器資料
      location: {
        address: fullAddress || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null
      }
    }

    await nextTick()
    isInitializing.value = false
    
    // 如果編輯模式下有城市，先載入該城市的行政區列表，然後再設置行政區
    if (cityName) {
      await loadDistrictsForCity(cityName)
      // 等待下一個 tick，確保行政區列表已經更新到 DOM
      await nextTick()
      // 現在設置行政區，這樣下拉選單已經有選項了
      if (districtName) {
        formData.value.district = districtName
      }
    }
    
    // 調試：輸出數據結構以便排查問題
    if (!formData.value.city || !formData.value.district) {
      console.warn('城市或行政區為空，數據結構：', {
        district: data.district,
        city: city,
        fullData: data
      })
    }
  } catch (error) {
    console.error('載入飯店資料失敗：', error)
    const errorMessage = error.message || '未知錯誤'
    toast.error('載入飯店資料失敗：' + errorMessage)
    
    // 如果是權限錯誤，提供更詳細的提示
    if (errorMessage.includes('未授權') || errorMessage.includes('只能查看自己的飯店')) {
      toast.error('您沒有權限查看此飯店，或該飯店不存在')
    }
    
    router.push('/')
  } finally {
    loading.value = false
  }
  
  // 初始化互動式地圖
  await nextTick()
  setTimeout(() => {
    initInteractiveMap()
  }, 500)
}

// 已停用：前端已使用 Google Maps API 進行地理編碼，不再需要後端 geocoding API
/*
const handleGeocoding = async () => {
  if (!formData.value.city || !formData.value.district || !formData.value.addressStreet || !formData.value.addressNumber) {
    toast.error('請先填寫完整地址（城市／行政區／道路與門牌號碼）')
    return
  }

  geocoding.value = true
  try {
    // 構建完整地址（就像在 Google 地圖上輸入一樣）
    const fullAddress = buildFullAddress()
    
    console.log('使用後端 API 進行地理編碼（完整地址）：', fullAddress)
    
    // 傳遞完整地址，以及城市和行政區（方便後端驗證和處理）
    const response = await geocodeAPI.geocode({
      address: fullAddress,
      city: formData.value.city,
      district: formData.value.district
    })
    
    const { latitude, longitude } = response
    
    console.log('取得座標（後端 API）：', { 
      latitude, 
      longitude,
      address: fullAddress
    })
    
    // 驗證座標是否在台灣範圍內
    // lat 應該是緯度（21.5-25.5），lon 應該是經度（119.0-122.0）
    if (latitude < 21.5 || latitude > 25.5 || longitude < 119.0 || longitude > 122.0) {
      toast.warning('取得的座標超出台灣範圍，請確認地址是否正確')
      console.warn('座標超出範圍：', { latitude, longitude })
      console.warn('如果地址是台北，預期座標應該在：緯度 24.5-25.5, 經度 121.0-122.0')
    }
    
    // 保留原始精度（後端返回 8 位小數精度）
    formData.value.latitude = latitude   // 緯度
    formData.value.longitude = longitude  // 經度
    toast.success('已自動取得座標')
    // 靜態地圖會自動更新（因為 URL 會改變）
  } catch (error) {
    // 提供更詳細的錯誤訊息
    let errorMessage = '地理編碼失敗'
    
    if (error.message) {
      errorMessage = error.message
    }
    
    // 對於多行錯誤訊息，簡化顯示但保留關鍵信息
    let displayMessage = errorMessage
    
    // 處理無法找到地址結果的錯誤
    if (errorMessage.includes('無法找到') || errorMessage.includes('地址驗證失敗') || errorMessage.includes('ZERO_RESULTS')) {
      const fullAddress = buildFullAddress()
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
      
      // 自動打開 Google Maps 搜尋該地址
      window.open(googleMapsUrl, '_blank')
      
      displayMessage = `無法自動取得座標。\n\n已為您打開 Google Maps 搜尋該地址。\n\n請按照以下步驟操作：\n1. 在 Google Maps 中找到正確的地址位置\n2. 點擊地址標記，複製瀏覽器網址列的 URL\n3. 將 URL 貼到下方的「手動輸入座標」欄位\n4. 點擊「套用」按鈕\n\n或者，您也可以直接在 Google Maps 中查看座標，然後手動輸入。`
      
      // 提示用戶可以使用手動輸入功能
      setTimeout(() => {
        toast.info('💡 提示：您可以在下方「手動輸入座標」欄位貼上 Google Maps URL 來自動取得座標', {
          duration: 8000
        })
      }, 2000)
    }
    
    console.error('地理編碼錯誤：', {
      error: error,
      message: errorMessage,
      formData: formData.value,
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
    })
    
    toast.error(displayMessage, {
      duration: 10000
    })
  } finally {
    geocoding.value = false
  }
}
*/

/**
 * 處理手動輸入的座標或從 Google Maps URL 提取座標
 * 支援格式：
 * 1. 直接輸入座標：24.152585,120.647048
 * 2. Google Maps URL：https://www.google.com/maps?ll=24.152585,120.647048&...
 */
const handleManualCoordinates = () => {
  const input = manualCoordinates.value.trim()
  if (!input) {
    toast.error('請輸入座標或貼上 Google Maps URL')
    return
  }

  let latitude = null
  let longitude = null

  try {
    // 檢查是否為 Google Maps URL
    if (input.includes('google.com/maps')) {
      // 格式1: /place/.../@24.152585,120.647048（從截圖看到的格式）
      // 例如：google.com/maps/place/407臺中市西屯區臺灣大道三段99號/@24.16...
      const placeAtMatch = input.match(/\/place\/[^@]*@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (placeAtMatch) {
        latitude = parseFloat(placeAtMatch[1])
        longitude = parseFloat(placeAtMatch[2])
        console.log('從 /place/.../@ 格式提取座標：', { latitude, longitude })
      }
      
      // 格式2: /@24.152585,120.647048（分享連結格式）
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        const atMatch = input.match(/\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
        if (atMatch) {
          latitude = parseFloat(atMatch[1])
          longitude = parseFloat(atMatch[2])
          console.log('從 /@ 格式提取座標：', { latitude, longitude })
        }
      }
      
      // 格式3: ?ll=24.152585,120.647048（查詢參數格式）
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        const llMatch = input.match(/[?&]ll=([^&]+)/)
        if (llMatch) {
          const coords = llMatch[1].split(',')
          if (coords.length === 2) {
            latitude = parseFloat(coords[0])
            longitude = parseFloat(coords[1])
            console.log('從 ?ll= 格式提取座標：', { latitude, longitude })
          }
        }
      }
      
      // 格式4: ?q=24.152585,120.647048（查詢參數格式）
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        const qMatch = input.match(/[?&]q=([^&]+)/)
        if (qMatch) {
          const decoded = decodeURIComponent(qMatch[1])
          // 檢查是否為座標格式（兩個數字用逗號分隔）
          const coordPattern = /^(-?\d+\.?\d*),(-?\d+\.?\d*)$/
          const coordMatch = decoded.match(coordPattern)
          if (coordMatch) {
            latitude = parseFloat(coordMatch[1])
            longitude = parseFloat(coordMatch[2])
            console.log('從 ?q= 格式提取座標：', { latitude, longitude })
          }
        }
      }
      
      // 格式5: 從完整 URL 中提取（備選方案，尋找任何看起來像座標的數字對）
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        // 嘗試從 URL 中尋找任何看起來像座標的數字對
        const coordPattern = /(-?\d+\.?\d*),(-?\d+\.?\d*)/
        const coordMatch = input.match(coordPattern)
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1])
          const lng = parseFloat(coordMatch[2])
          // 驗證是否在合理的台灣座標範圍內
          if (lat >= 21 && lat <= 26 && lng >= 119 && lng <= 123) {
            latitude = lat
            longitude = lng
            console.log('從 URL 中自動提取座標：', { latitude, longitude })
          }
        }
      }
    } else {
      // 直接輸入座標格式：24.152585,120.647048
      const coords = input.split(',')
      if (coords.length === 2) {
        latitude = parseFloat(coords[0].trim())
        longitude = parseFloat(coords[1].trim())
      }
    }

    // 驗證座標
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('無法解析座標格式')
    }

    // 驗證座標是否在台灣範圍內
    if (latitude < 21.5 || latitude > 25.5 || longitude < 119.0 || longitude > 122.0) {
      toast.warning('座標超出台灣範圍，但仍會套用')
    }

    // 套用座標
    formData.value.latitude = latitude
    formData.value.longitude = longitude
    manualCoordinates.value = '' // 清空輸入框
    toast.success(`✅ 已成功提取並套用座標：${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
    console.log('成功提取座標：', { latitude, longitude, originalInput: input })
  } catch (error) {
    console.error('解析座標失敗：', error, { input })
    toast.error('無法解析座標。請確認：\n1. 是否為完整的 Google Maps URL\n2. 或使用格式：24.152585,120.647048')
  }
}

/**
 * 處理貼上 Google Maps URL 的事件
 * 當用戶貼上 URL 時，自動嘗試提取座標
 */
const handlePasteGoogleMapsUrl = (event) => {
  // 延遲執行，等待貼上內容完成
  setTimeout(() => {
    const pastedText = manualCoordinates.value.trim()
    if (pastedText.includes('google.com/maps')) {
      // 如果是 Google Maps URL，自動嘗試提取座標
      console.log('偵測到 Google Maps URL，自動提取座標...')
      handleManualCoordinates()
    }
  }, 100)
}

const handleSubmit = async () => {
  // 驗證必填欄位
  if (!formData.value.name?.trim()) {
    toast.error('請填寫飯店名稱')
    return
  }

  if (!formData.value.license?.trim()) {
    toast.error('請填寫執照號碼')
    return
  }

  // 優先使用 Booking.com 風格的位置選擇器資料
  const hasLocationPickerData = formData.value.location?.address && 
                                 formData.value.location?.latitude && 
                                 formData.value.location?.longitude
  
  // 如果沒有使用位置選擇器，檢查舊的輸入方式
  if (!hasLocationPickerData) {
    toast.error('請使用上方的地址選擇器選擇地址')
    return
  }

  // 驗證城市和行政區是否已選擇
  if (!formData.value.city || !formData.value.district) {
    toast.error('請選擇城市和行政區')
    return
  }

  loading.value = true

  try {
    // 優先使用 Booking.com 風格的位置選擇器資料
    const hasLocationPickerData = formData.value.location?.address && 
                                   formData.value.location?.latitude && 
                                   formData.value.location?.longitude
    
    let fullAddress
    let finalLatitude
    let finalLongitude
    
    if (hasLocationPickerData) {
      // 使用位置選擇器的資料
      fullAddress = formData.value.location.address
      finalLatitude = formData.value.location.latitude
      finalLongitude = formData.value.location.longitude
      
      // 嘗試從地址中提取城市和行政區（如果有）
      // 這裡可以進一步優化，使用 Google Geocoding API 解析地址元件
    } else {
      // 使用舊的輸入方式
      fullAddress = buildFullAddress()
      finalLatitude = formData.value.latitude
      finalLongitude = formData.value.longitude
    }

    // 根據行政區名稱獲取 districtId（仍然需要城市和行政區用於後端查詢）
    const districtId = await getDistrictIdByName(formData.value.district, formData.value.city)
    
    if (!districtId) {
      toast.error(`無法找到行政區 "${formData.value.district}" 的 ID，請確認後端資料庫中有此行政區資料`)
      loading.value = false
      return
    }

    // 轉換前端表單格式到後端 API 格式
    const normalizeTime = (time) => {
      if (!time || time.trim() === '') return null
      return time.length === 5 ? `${time}:00` : time
    }

    // 確保必填欄位不是空字串（轉換為 null 或保留原值）
    const normalizeString = (value) => {
      if (!value || value.trim() === '') return null
      return value.trim()
    }
    
    const hotelData = {
      name: formData.value.name?.trim() || '', // name 和 license 必須有值（不能為 null）
      license: formData.value.license?.trim() || '',
      description: normalizeString(formData.value.description),
      hotelTypeId: formData.value.hotel_type ? parseInt(formData.value.hotel_type) : null,
      districtId: districtId,
      address: fullAddress,
      latitude: finalLatitude,
      longitude: finalLongitude,
      phone: normalizeString(formData.value.phone),
      localCall: normalizeString(formData.value.localCall),
      checkInTime: normalizeTime(formData.value.check_in_time),
      checkOutTime: normalizeTime(formData.value.check_out_time),
      // 營業狀態：只有在必填資料完成時才能為 true
      // 表單中不提供營業狀態切換，用戶只能在飯店列表頁面切換
      // 如果必填資料未完成，強制設為 false；如果完成，保持原有狀態（編輯時）或設為 false（新增時）
      // 重要：即使用戶嘗試設定為 true，如果必填資料未完成，也會強制設為 false
      businessStatus: canOpenBusiness.value && formData.value.business_status ? true : false,
      starRating: formData.value.star_rating ? parseInt(formData.value.star_rating) : null,
    }

    // 調試：輸出將要發送的資料
    console.log('準備儲存飯店，資料：', {
      isEdit: isEdit,
      hotelId: id,
      city: formData.value.city,
      district: formData.value.district,
      districtId: districtId,
      address: fullAddress,
      hotelData: hotelData
    })

    let savedHotelId = id
    
    if (isEdit) {
      // 調試：輸出更新前的資料
      console.log('更新飯店，ID:', id, '資料:', hotelData)
      
      const response = await hotelAPI.updateHotel(id, hotelData)
      
      // 調試：輸出更新後的響應
      console.log('更新飯店響應:', response)
      
      // 驗證響應是否包含更新後的資料
      if (response && response.id) {
        toast.success('飯店已更新')
      } else {
        console.warn('更新響應異常，響應內容：', response)
        toast.warning('飯店更新完成，但請確認資料是否正確')
      }
    } else {
      const response = await hotelAPI.createHotel(hotelData)
      toast.success('飯店已新增')
      // 如果創建成功，從響應中獲取飯店 ID
      // HotelDTO 應該包含 id 欄位
      if (response && (response.id || response.hotelId)) {
        savedHotelId = response.id || response.hotelId
      } else {
        // 如果響應中沒有 id，嘗試從響應的 data 中獲取
        console.warn('創建飯店響應中未找到 id，響應內容：', response)
      }
    }

    // 檢查是否是從引導式新增頁面跳轉過來的
    const fromSetup = route.query.from === 'setup'
    
    if (fromSetup && savedHotelId) {
      // 跳轉回引導式新增頁面，並傳遞 hotelId，同時確保回到步驟1
      router.push(`/hotels/${savedHotelId}/setup?step=1`)
    } else {
      // 否則跳轉回飯店列表
      router.push('/')
    }
  } catch (error) {
    // 提供更詳細的錯誤訊息
    let errorMessage = '儲存飯店失敗'
    
    console.error('儲存飯店錯誤：', error)
    
    if (error.message) {
      errorMessage = error.message
      
      // 如果是登入過期錯誤，只顯示提示，不自動重定向
      if (errorMessage.includes('登入已過期') || errorMessage.includes('未授權') || errorMessage.includes('未登入')) {
        toast.error('登入已過期，請重新登入後再試')
        // 不自動重定向，讓用戶繼續操作或自行決定是否重新登入
        return
      }
      
      // 如果是驗證錯誤，顯示更詳細的訊息
      if (errorMessage.includes('驗證失敗') || errorMessage.includes('不能為空')) {
        console.error('驗證錯誤詳情：', error)
      }
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = '無法連接到後端服務器。請確認後端服務器是否正在運行'
    }
    
    // 修改：顯示更友好的錯誤訊息
    // 如果是驗證錯誤，已經在 apiRequest 中處理過了
    toast.error(errorMessage)
    
    console.error('儲存飯店失敗：', {
      error: error,
      message: error.message,
      stack: error.stack,
      formData: formData.value,
      hotelData: {
        name: formData.value.name,
        license: formData.value.license,
        hotelTypeId: formData.value.hotel_type ? parseInt(formData.value.hotel_type) : null,
        districtId: districtId,
        address: fullAddress,
        latitude: finalLatitude,
        longitude: finalLongitude
      }
    })
  } finally {
    loading.value = false
  }
}

const navigate = (path) => {
  router.push(path)
}
</script>
