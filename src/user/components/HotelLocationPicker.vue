<template>
  <div class="location-picker">
    <!-- 地址輸入（含自動完成） -->
    <div class="address-section">
      <label class="section-label">飯店地址</label>
      
      <div class="address-input-wrapper">
        <input
          ref="addressInputRef"
          v-model="address"
          type="text"
          placeholder="開始輸入地址，將顯示建議選項..."
          class="address-input"
        />
        
        <div v-if="isSearching" class="searching-hint">
          <svg class="loading-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          搜尋中...
        </div>
      </div>
      
      <!-- 提示訊息 -->
      <div class="hint-text">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        請輸入完整地址（包含縣市、區域、街道、門牌號碼）
      </div>
    </div>
    
    <!-- 地圖預覽 -->
    <div class="map-section" v-if="latitude && longitude">
      <label class="section-label">確認位置</label>
      
      <!-- 使用 iframe 顯示地圖（只讀預覽，節省 API 請求） -->
      <div class="map-container">
        <iframe
          :src="mapEmbedUrl"
          class="map-iframe"
          frameborder="0"
          style="border:0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      
      <!-- 座標資訊 -->
      <div class="coordinates-info">
        <div class="info-item">
          <span class="info-label">緯度：</span>
          <span class="info-value">{{ displayLatitude }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">經度：</span>
          <span class="info-value">{{ displayLongitude }}</span>
        </div>
        <div class="info-item" v-if="formattedAddress">
          <span class="info-label">Google 地址：</span>
          <span class="info-value">{{ formattedAddress }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { loadGoogleMaps } from '@/user/utils/googleMaps'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      address: '',
      latitude: null,
      longitude: null
    })
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Refs
const addressInputRef = ref(null)
const mapContainer = ref(null)

// 資料
const address = ref(props.modelValue?.address || '')
const latitude = ref(props.modelValue?.latitude || null)
const longitude = ref(props.modelValue?.longitude || null)
const formattedAddress = ref('')
const isSearching = ref(false)
// 注意：不再使用 currentCity 和 currentDistrict，因為城市和行政區由父組件手動選擇

// 緩存機制：避免重複請求相同地址
const addressCache = new Map() // key: "lat,lng" -> { address, city, district }
const placeCache = new Map() // key: place_id -> { place data }

// Google Maps 相關（僅用於 Autocomplete）
let autocomplete = null
let google = null
let autocompleteSessionToken = null // Session Token 用於合併 Autocomplete 和 Place Details 計費

// 計算屬性
const displayLatitude = computed(() => {
  return latitude.value ? latitude.value.toFixed(6) : '尚未選擇'
})

const displayLongitude = computed(() => {
  return longitude.value ? longitude.value.toFixed(6) : '尚未選擇'
})

// Google Maps Embed API URL（用於只讀預覽，節省 JavaScript API 請求）
const mapEmbedUrl = computed(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!latitude.value || !longitude.value || !apiKey) {
    return ''
  }
  
  // 使用 Maps Embed API，更節省 API 請求
  // 格式：https://www.google.com/maps/embed/v1/place?key=API_KEY&q=lat,lng&zoom=17
  const q = `${latitude.value},${longitude.value}`
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}&zoom=17&language=zh-TW&region=TW`
})

// 初始化 Autocomplete（僅用於輸入地址，地圖使用 iframe 預覽）
async function initMap() {
  try {
    // 只載入 Google Maps API（用於 Autocomplete）
    google = await loadGoogleMaps()
    
    // 如果有初始地址和座標，更新顯示
    if (props.modelValue?.address) {
      address.value = props.modelValue.address
      formattedAddress.value = props.modelValue.address
    }
    
    if (props.modelValue?.latitude != null && props.modelValue?.longitude != null) {
      latitude.value = props.modelValue.latitude
      longitude.value = props.modelValue.longitude
      
      // 如果地址不完整但經緯度存在，自動進行反向地理編碼補全
      // 優化：先檢查緩存，避免不必要的請求
      const currentAddress = props.modelValue?.address || ''
      if (!isAddressComplete(currentAddress)) {
        const cacheKey = `${props.modelValue.latitude.toFixed(6)},${props.modelValue.longitude.toFixed(6)}`
        const cached = addressCache.get(cacheKey)
        
        // 如果緩存中有完整地址，直接使用，不進行反向地理編碼
        if (cached && cached.address && isAddressComplete(cached.address)) {
          console.log('✅ 使用緩存的完整地址，跳過反向地理編碼:', cacheKey)
          address.value = cached.address
          formattedAddress.value = cached.address
        } else {
          console.log('📍 地址不完整，自動進行反向地理編碼補全:', currentAddress)
          console.log('   座標:', { lat: props.modelValue.latitude, lng: props.modelValue.longitude })
          
          // 立即進行反向地理編碼（不使用防抖，因為這是載入時的補全）
          reverseGeocodeImmediate(props.modelValue.latitude, props.modelValue.longitude)
        }
      }
    }
    
    // 初始化 Autocomplete（核心功能！）
    // 使用 nextTick 確保 DOM 已完全渲染
    await nextTick()
    initAutocomplete(google)
    
  } catch (error) {
    console.error('❌ 初始化地址輸入功能失敗:', error)
    console.error('錯誤詳情:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    
    // 檢查是否是 API Key 相關錯誤
    const isApiKeyError = error.message && (
      error.message.includes('ApiProjectMapError') ||
      error.message.includes('NoApiKeys') ||
      error.message.includes('REQUEST_DENIED') ||
      error.message.includes('API Key')
    )
    
    let errorMessage = '載入地址輸入功能失敗'
    if (isApiKeyError) {
      errorMessage = `Google Maps API Key 驗證失敗

🔴 最常見原因：API Key 未關聯計費帳戶

即使使用免費額度，也必須關聯計費帳戶！

請立即檢查：
1. 登入 Google Cloud Console
2. 前往「API 和服務」>「憑證」
3. 點擊您的 API Key
4. 檢查「計費帳戶」欄位
5. 如果顯示「未關聯」，請點擊「連結計費帳戶」

其他檢查項目：
- ✅ 已啟用 Maps JavaScript API 和 Places API
- ✅ 計費帳戶狀態為「有效」或「試用中」
- ✅ API Key 使用限制允許您的網域

詳細診斷步驟請查看 API_KEY_DIAGNOSIS.md`
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.error(errorMessage, {
      duration: 15000
    })
  }
}

// 初始化地址自動完成（Booking.com 的核心功能）
function initAutocomplete(google) {
  console.log('🔍 開始初始化 Autocomplete...')
  
  if (!addressInputRef.value) {
    console.warn('⚠️ addressInputRef.value 不存在，無法初始化 Autocomplete')
    console.warn('addressInputRef:', addressInputRef)
    return
  }
  
  console.log('✅ addressInputRef.value 存在:', addressInputRef.value)
  console.log('✅ 輸入框類型:', addressInputRef.value.tagName)
  
  // 檢查 Places API 是否可用
  if (!google || !google.maps || !google.maps.places) {
    console.error('❌ Places API 未載入，無法建立 Autocomplete')
    console.error('google:', google)
    console.error('google.maps:', google?.maps)
    console.error('google.maps.places:', google?.maps?.places)
    toast.error('Places API 未載入，請確認 API Key 已啟用 Places API')
    return
  }
  
  console.log('✅ Places API 可用')
  console.log('✅ Autocomplete 類別:', google.maps.places.Autocomplete)
  
  try {
    // 建立 Autocomplete
    console.log('🔨 建立 Autocomplete 實例...')
    console.log('🔍 輸入框元素:', addressInputRef.value)
    console.log('🔍 輸入框 ID:', addressInputRef.value?.id)
    console.log('🔍 輸入框類型:', addressInputRef.value?.tagName)
    
    // 建立 Session Token（用於合併 Autocomplete 和 Place Details 計費，減少請求次數）
    autocompleteSessionToken = new google.maps.places.AutocompleteSessionToken()
    
    // 優化：只顯示地址建議，減少不必要的 POI 請求
    // 優化：使用 Session Token 可以將 Autocomplete 和 Place Details 合併為一次計費
    autocomplete = new google.maps.places.Autocomplete(addressInputRef.value, {
      componentRestrictions: { country: 'tw' },
      fields: ['address_components', 'geometry', 'formatted_address', 'name', 'place_id'],
      types: ['address'], // 只顯示地址建議，減少 POI 相關的請求
      sessionToken: autocompleteSessionToken // 使用 Session Token 減少計費
    })
    
    console.log('✅ Autocomplete 已建立:', autocomplete)
    console.log('✅ Autocomplete 設定:', {
      componentRestrictions: autocomplete.componentRestrictions,
      fields: autocomplete.fields
    })
    
    // 驗證 Autocomplete 是否正常工作
    // 注意：Autocomplete 不會立即顯示建議，只有在使用者輸入時才會顯示
    console.log('✅ Autocomplete 已準備就緒，等待使用者輸入...')
    
    // 測試：檢查 Autocomplete 的內部狀態
    if (autocomplete.getPlace) {
      console.log('✅ Autocomplete.getPlace() 方法可用')
    }
    
    // 優化：添加輸入防抖，至少輸入 3 個字元才觸發 Autocomplete
    // 這樣可以減少不必要的 API 請求
    let inputTimer = null
    addressInputRef.value.addEventListener('input', (e) => {
      const inputValue = e.target.value.trim()
      
      // 清除之前的計時器
      if (inputTimer) {
        clearTimeout(inputTimer)
      }
      
      // 如果輸入少於 3 個字元，不觸發 Autocomplete（減少請求）
      if (inputValue.length < 3) {
        return
      }
      
      // 防抖：延遲 300ms 後才觸發（Google 內建防抖約 200ms，我們再加 300ms）
      inputTimer = setTimeout(() => {
        // Autocomplete 會自動處理，這裡不需要額外操作
        console.log('📍 觸發 Autocomplete 建議（已輸入', inputValue.length, '個字元）')
      }, 300)
    })
    
  } catch (error) {
    console.error('❌ 建立 Autocomplete 失敗:', error)
    console.error('錯誤詳情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // 檢查是否是 API Key 相關錯誤
    if (error.message && (error.message.includes('ApiProjectMapError') || error.message.includes('NoApiKeys'))) {
      toast.error('Autocomplete 初始化失敗：API Key 驗證失敗。請確認 API Key 已關聯計費帳戶並啟用 Places API', {
        duration: 10000
      })
    } else {
      toast.error('無法建立地址自動完成功能，請確認 API Key 設定正確')
    }
    return
  }
  
  // 監聽地點選擇
  autocomplete.addListener('place_changed', async () => {
    isSearching.value = true
    
    // 使用 Session Token 獲取地點詳情（與 Autocomplete 合併計費）
    const place = autocomplete.getPlace()
    
    // 重置 Session Token（為下次查詢準備）
    autocompleteSessionToken = new google.maps.places.AutocompleteSessionToken()
    autocomplete.set('sessionToken', autocompleteSessionToken)
    
    if (!place.geometry || !place.geometry.location) {
      toast.warning('找不到該地址的位置資訊')
      isSearching.value = false
      return
    }
    
    // 檢查緩存（使用 place_id 作為 key）
    const placeId = place.place_id
    if (placeId && placeCache.has(placeId)) {
      const cached = placeCache.get(placeId)
      console.log('✅ 使用緩存的地址資料:', placeId)
      
      address.value = cached.address
      formattedAddress.value = cached.address
      latitude.value = cached.latitude
      longitude.value = cached.longitude
      
      await emitUpdate()
      isSearching.value = false
      toast.success('已定位到地址，地圖將顯示在下方')
      return
    }
    
    // 取得座標
    const location = place.geometry.location
    const lat = location.lat()
    const lng = location.lng()
    
    // 檢查座標緩存
    const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
    if (addressCache.has(coordKey)) {
      const cached = addressCache.get(coordKey)
      console.log('✅ 使用緩存的座標資料:', coordKey)
      
      address.value = cached.address
      formattedAddress.value = cached.address
      latitude.value = lat
      longitude.value = lng
      
      // 更新 place 緩存
      if (placeId) {
        placeCache.set(placeId, {
          address: cached.address,
          latitude: lat,
          longitude: lng
        })
      }
      
      await emitUpdate()
      isSearching.value = false
      toast.success('已定位到地址，地圖將顯示在下方')
      return
    }
    
    // 檢查是否在台灣
    if (!isInTaiwan(lat, lng)) {
      toast.error('請選擇台灣境內的地址')
      isSearching.value = false
      return
    }
    
    // 先更新地址（使用 Google 提供的格式化地址）
    const completeAddress = place.formatted_address || place.name || ''
    address.value = completeAddress
    formattedAddress.value = completeAddress
    
    // 更新座標（地圖使用 iframe 顯示，不需要操作互動地圖）
    // 注意：不再解析城市和行政區，因為用戶會手動選擇
    await updateCoordinates(lat, lng)
    
    // 儲存到緩存（使用已計算的座標）
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
    addressCache.set(cacheKey, {
      address: completeAddress
    })
    
    if (placeId) {
      placeCache.set(placeId, {
        address: completeAddress,
        latitude: lat,
        longitude: lng
      })
    }
    
    // 如果地址不夠精確，提示使用者
    if (place.geometry.location_type === 'APPROXIMATE') {
      toast.warning('地址精確度較低，請確認位置是否正確', {
        duration: 5000
      })
    } else {
      toast.success('已定位到地址，地圖將顯示在下方')
    }
    
    isSearching.value = false
  })
}

// 反向地理編碼的防抖處理（避免拖曳時頻繁請求）
let reverseGeocodeTimer = null
let lastReverseGeocodeCoords = null // 記錄上次反向地理編碼的座標，避免重複請求

// 立即進行反向地理編碼（不使用防抖，用於載入時補全地址）
async function reverseGeocodeImmediate(lat, lng) {
  try {
    // 優先檢查緩存（避免重複請求）
    const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
    if (addressCache.has(coordKey)) {
      const cached = addressCache.get(coordKey)
      if (cached.address && isAddressComplete(cached.address)) {
        console.log('✅ 使用緩存的反向地理編碼結果，跳過 API 請求:', coordKey)
        address.value = cached.address
        formattedAddress.value = cached.address
        emitUpdate()
        return
      }
    }
    
    // 檢查座標是否已經處理過（避免重複請求）
    if (lastReverseGeocodeCoords) {
      const latDiff = Math.abs(lastReverseGeocodeCoords.lat - lat)
      const lngDiff = Math.abs(lastReverseGeocodeCoords.lng - lng)
      if (latDiff < 0.00001 && lngDiff < 0.00001) {
        console.log('📍 座標已處理過，跳過反向地理編碼')
        return
      }
    }
    
    // 記錄本次請求的座標
    lastReverseGeocodeCoords = { lat, lng }
    
    const google = await loadGoogleMaps()
    const geocoder = new google.maps.Geocoder()
    
    const latlng = { lat, lng }
    
    console.log('🔍 執行反向地理編碼（補全地址）:', latlng)
    
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const completeAddress = results[0].formatted_address
          address.value = completeAddress
          formattedAddress.value = completeAddress
          
          // 注意：不再解析城市和行政區，因為用戶會手動選擇
          // 儲存到緩存（避免下次編輯時重複請求）
          const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
          addressCache.set(coordKey, {
            address: completeAddress
          })
          
          console.log('✅ 地址已補全:', completeAddress)
          console.log('   已儲存到緩存:', coordKey)
          
          // 發送更新（包含補全後的完整地址）
          emitUpdate()
          
          toast.success('地址已自動補全為完整地址', {
            duration: 3000
          })
      } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
        console.warn('⚠️ 反向地理編碼失敗（補全地址）:', status, '（可能是 API Key 或 Geocoding API 未啟用）')
        toast.warning('無法自動補全地址，請手動輸入完整地址', {
          duration: 5000
        })
      } else if (status === 'ZERO_RESULTS') {
        console.warn('⚠️ 反向地理編碼無結果（補全地址）:', status)
        toast.warning('無法找到對應地址，請手動輸入完整地址', {
          duration: 5000
        })
      } else {
        console.warn('⚠️ 反向地理編碼失敗（補全地址）:', status)
      }
    })
  } catch (error) {
    console.error('❌ 反向地理編碼失敗（補全地址）:', error)
    toast.warning('無法自動補全地址，請手動輸入完整地址', {
      duration: 5000
    })
  }
}

// 反向地理編碼（座標轉地址）
async function reverseGeocode(lat, lng, forceUpdate = false) {
  // 清除之前的計時器
  if (reverseGeocodeTimer) {
    clearTimeout(reverseGeocodeTimer)
    reverseGeocodeTimer = null
  }
  
  // 檢查座標是否真的改變了（避免相同座標的重複請求）
  if (!forceUpdate && lastReverseGeocodeCoords) {
    const latDiff = Math.abs(lastReverseGeocodeCoords.lat - lat)
    const lngDiff = Math.abs(lastReverseGeocodeCoords.lng - lng)
    // 如果座標差異很小（小於 0.00001 度，約 1 米），不進行反向地理編碼
    if (latDiff < 0.00001 && lngDiff < 0.00001) {
      console.log('📍 座標未明顯改變，跳過反向地理編碼')
      return
    }
  }
  
  // 防抖：拖曳標記時，等待 1500ms 後再進行反向地理編碼
  // 這樣可以避免拖曳過程中每次都調用 API，減少 API 請求次數
  reverseGeocodeTimer = setTimeout(async () => {
    try {
      // 記錄本次請求的座標
      lastReverseGeocodeCoords = { lat, lng }
      
      const google = await loadGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      
      const latlng = { lat, lng }
      
      console.log('🔍 執行反向地理編碼:', latlng)
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          address.value = results[0].formatted_address
          formattedAddress.value = results[0].formatted_address
          console.log('✅ 反向地理編碼成功:', results[0].formatted_address)
          
          // 發送更新
          emitUpdate()
        } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
          console.warn('⚠️ 反向地理編碼失敗:', status, '（可能是 API Key 或 Geocoding API 未啟用）')
          // 如果 API Key 有問題，不更新地址，保持原有地址
        } else if (status === 'ZERO_RESULTS') {
          console.warn('⚠️ 反向地理編碼無結果:', status)
          // 座標沒有對應的地址，不更新
        } else {
          console.warn('⚠️ 反向地理編碼失敗:', status)
        }
      })
    } catch (error) {
      console.error('❌ 反向地理編碼失敗:', error)
    } finally {
      reverseGeocodeTimer = null
    }
  }, 1500) // 拖曳結束後 1500ms 才進行反向地理編碼（增加延遲以減少 API 請求）
}

// 更新座標
async function updateCoordinates(lat, lng) {
  if (!isInTaiwan(lat, lng)) {
    toast.error('座標不在台灣範圍內')
    return
  }
  
  latitude.value = parseFloat(lat.toFixed(8))
  longitude.value = parseFloat(lng.toFixed(8))
  
  // 發送更新給父元件（會自動檢查並補全地址）
  await emitUpdate()
}

// 檢查是否在台灣
function isInTaiwan(lat, lng) {
  return lat >= 21.5 && lat <= 25.5 && lng >= 119.0 && lng <= 122.0
}

// 檢查地址是否完整
function isAddressComplete(address) {
  if (!address || address.trim() === '') {
    return false
  }
  
  const addr = address.trim()
  
  // 如果地址太短（小於 5 個字元），可能不完整
  if (addr.length < 5) {
    return false
  }
  
  // 檢查是否包含常見的不完整標記
  // 例如：只有路名、沒有城市和區的資訊
  const incompletePatterns = [
    /^[^市縣].*[路段號]$/, // 開頭沒有城市，但有路段號（如：內湖路一段396號）
    /^資展$/i, // 簡稱或代號
    /^[A-Za-z0-9]+$/, // 只有英文或數字（可能是代號）
    /^.{1,3}$/ // 只有 1-3 個字元（太短）
  ]
  
  // 如果符合任何不完整模式，返回 false
  for (const pattern of incompletePatterns) {
    if (pattern.test(addr)) {
      return false
    }
  }
  
  // 檢查是否包含完整的地址結構（至少包含城市或區）
  const completePatterns = [
    /.*[市縣].*[區鄉鎮].*/, // 包含城市和區
    /台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市/, // 包含主要城市
    /[0-9]+號/, // 包含門牌號碼
  ]
  
  // 至少符合一個完整模式，或長度足夠（可能是完整地址）
  const hasCompletePattern = completePatterns.some(pattern => pattern.test(addr))
  const isLongEnough = addr.length >= 10 // 至少 10 個字元
  
  return hasCompletePattern || isLongEnough
}

// 發送更新（確保地址完整）
async function emitUpdate() {
  // 檢查地址是否完整，如果不完整但有座標，立即補全
  const currentAddress = address.value || ''
  const currentLat = latitude.value
  const currentLng = longitude.value
  
  // 先檢查緩存
  if (currentLat != null && currentLng != null) {
    const coordKey = `${currentLat.toFixed(6)},${currentLng.toFixed(6)}`
    if (addressCache.has(coordKey)) {
      const cached = addressCache.get(coordKey)
      // 如果緩存中有完整地址，直接使用
      if (cached.address && isAddressComplete(cached.address)) {
        console.log('✅ 使用緩存的完整地址，跳過反向地理編碼')
        address.value = cached.address
        formattedAddress.value = cached.address
      }
    }
  }
  
  // 只有在地址不完整且緩存中沒有時，才進行反向地理編碼
  if (currentLat != null && currentLng != null && !isAddressComplete(currentAddress)) {
    // 檢查緩存中是否有完整地址
    const cacheKey = `${currentLat.toFixed(6)},${currentLng.toFixed(6)}`
    const cached = addressCache.get(cacheKey)
    
    // 如果緩存中有完整地址，直接使用，不進行反向地理編碼
    if (cached && cached.address && isAddressComplete(cached.address)) {
      console.log('✅ 使用緩存的完整地址，跳過反向地理編碼')
      address.value = cached.address
      formattedAddress.value = cached.address
    } else if (!cached || !isAddressComplete(cached?.address || '')) {
      // 只有在緩存中沒有或緩存的地址也不完整時，才進行反向地理編碼
      console.log('📍 儲存前發現地址不完整，立即補全:', currentAddress)
      
      // 立即進行反向地理編碼補全（不使用防抖，等待完成後再發送）
      await reverseGeocodeImmediateSync(currentLat, currentLng)
    }
  }
  
  // 發送更新（此時地址應該已經完整）
  // 注意：不再 emit city 和 district，因為父組件會手動選擇
  emit('update:modelValue', {
    address: address.value, // 可能是補全後的地址
    latitude: latitude.value,
    longitude: longitude.value
  })
}

// 同步版本的反向地理編碼（返回 Promise，等待完成）
async function reverseGeocodeImmediateSync(lat, lng) {
  return new Promise((resolve) => {
    // 檢查座標是否已經處理過（避免重複請求）
    if (lastReverseGeocodeCoords) {
      const latDiff = Math.abs(lastReverseGeocodeCoords.lat - lat)
      const lngDiff = Math.abs(lastReverseGeocodeCoords.lng - lng)
      if (latDiff < 0.00001 && lngDiff < 0.00001) {
        console.log('📍 座標已處理過，跳過補全')
        resolve()
        return
      }
    }
    
    // 記錄本次請求的座標
    lastReverseGeocodeCoords = { lat, lng }
    
    loadGoogleMaps().then((google) => {
      const geocoder = new google.maps.Geocoder()
      const latlng = { lat, lng }
      
      console.log('🔍 執行反向地理編碼（儲存前補全）:', latlng)
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const completeAddress = results[0].formatted_address
          address.value = completeAddress
          formattedAddress.value = completeAddress
          
          // 注意：不再解析城市和行政區，因為用戶會手動選擇
          console.log('✅ 地址已補全（儲存前）:', completeAddress)
          resolve(completeAddress)
        } else {
          console.warn('⚠️ 反向地理編碼失敗（儲存前補全）:', status)
          // 即使補全失敗，也繼續執行（保留原有地址）
          resolve(null)
        }
      })
    }).catch((error) => {
      console.error('❌ 反向地理編碼失敗（儲存前補全）:', error)
      resolve(null)
    })
  })
}

// 監聽 props 變化（編輯模式下載入資料時更新地圖位置）
watch(() => props.modelValue, (newVal, oldVal) => {
  if (newVal) {
    const newAddress = newVal.address || ''
    const newLatitude = newVal.latitude
    const newLongitude = newVal.longitude
    
    // 檢查座標是否真的改變了（避免不必要的更新）
    const oldLat = oldVal?.latitude
    const oldLng = oldVal?.longitude
    const coordsChanged = oldLat !== newLatitude || oldLng !== newLongitude
    
    // 更新內部狀態
    if (newAddress) {
      address.value = newAddress
      formattedAddress.value = newAddress
    }
    
    if (newLatitude != null && newLongitude != null) {
      latitude.value = newLatitude
      longitude.value = newLongitude
      
      // 更新座標（地圖使用 iframe 顯示，不需要操作互動地圖）
      if (coordsChanged) {
        latitude.value = newLatitude
        longitude.value = newLongitude
        
        console.log('📍 座標已更新:', { lat: newLatitude, lng: newLongitude })
        console.log('   地址:', newAddress)
        
        // 如果地址不完整但經緯度存在，自動進行反向地理編碼補全
        // 優化：先檢查緩存，避免不必要的請求
        if (!isAddressComplete(newAddress)) {
          const cacheKey = `${newLatitude.toFixed(6)},${newLongitude.toFixed(6)}`
          const cached = addressCache.get(cacheKey)
          
          // 如果緩存中有完整地址，直接使用，不進行反向地理編碼
          if (cached && cached.address && isAddressComplete(cached.address)) {
            console.log('✅ 使用緩存的完整地址，跳過反向地理編碼:', cacheKey)
            address.value = cached.address
            formattedAddress.value = cached.address
          } else {
            console.log('📍 地址不完整，自動進行反向地理編碼補全:', newAddress)
            
            // 立即進行反向地理編碼（不使用防抖，因為這是載入時的補全）
            reverseGeocodeImmediate(newLatitude, newLongitude)
          }
        }
      }
    }
  }
}, { deep: true, immediate: false })

// 監聽地址變化（手動輸入時）
watch(address, (newVal) => {
  if (newVal !== formattedAddress.value && newVal) {
    // 使用者手動輸入地址時，不立即更新 formattedAddress
    // 等待 Autocomplete 選擇後再更新
  }
})

// 生命週期
// 注意：在 async setup() 中，lifecycle hooks 必須在同步部分註冊
onMounted(async () => {
  await initMap()
})

onBeforeUnmount(() => {
  // 清理事件監聽器（僅清理 Autocomplete）
  if (google && google.maps && autocomplete) {
    google.maps.event.clearInstanceListeners(autocomplete)
  }
})
</script>

<style scoped>
.location-picker {
  width: 100%;
}

.address-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.label-hint {
  font-weight: 400;
  color: #909399;
  font-size: 13px;
}

.address-input-wrapper {
  position: relative;
  z-index: 1; /* 確保輸入框在正確的層級 */
}

.address-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.address-input:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.searching-hint {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409EFF;
  font-size: 13px;
  pointer-events: none;
}

.loading-icon {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hint-text {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.map-section {
  margin-top: 24px;
}

.map-container {
  width: 100%;
  height: 450px;
  border-radius: 8px;
  border: 1px solid #DCDFE6;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.coordinates-info {
  margin-top: 12px;
  padding: 12px;
  background-color: #F5F7FA;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #606266;
  font-weight: 500;
  margin-right: 4px;
}

.info-value {
  color: #303133;
  font-family: 'Courier New', monospace;
}

/* Autocomplete 下拉選單樣式調整 */
:deep(.pac-container) {
  border-radius: 4px;
  margin-top: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-family: inherit;
  z-index: 10000 !important; /* 提高 z-index 確保顯示在最上層 */
  position: absolute !important;
  display: block !important;
  visibility: visible !important;
}

:deep(.pac-item) {
  padding: 10px 12px;
  cursor: pointer;
  border-top: 1px solid #EBEEF5;
}

:deep(.pac-item:first-child) {
  border-top: none;
}

:deep(.pac-item:hover) {
  background-color: #F5F7FA;
}

:deep(.pac-item-selected) {
  background-color: #ECF5FF;
}

:deep(.pac-icon) {
  margin-top: 4px;
}

:deep(.pac-matched) {
  font-weight: 600;
  color: #409EFF;
}
</style>

