<template>
  <div class="min-h-screen bg-[#f5fbf8]">
    <UserNavbar />

    <!-- 搜尋區塊 -->
    <section class="booking-search">
      <div class="search-bar">
        <div class="search-field">
          <label>目的地</label>
          <input type="text" placeholder="輸入城市或飯店名稱" v-model="destination">
        </div>

        <div class="search-field">
          <label>入住日期</label>
          <input type="date" v-model="checkIn">
        </div>

        <div class="search-field">
          <label>退房日期</label>
          <input type="date" v-model="checkOut">
        </div>

        <div class="search-field">
          <label>人數</label>
          <div class="guest-box" @click="toggleGuestBox">
            {{ guests }} 位旅客
            <div v-if="showGuestBox" class="guest-popup">
              <button type="button" @click.stop="decrementGuest">-</button>
              <input type="text" class="inputGuest" v-model="guests" @click.stop>
              <button type="button" @click.stop="incrementGuest">+</button>
            </div>
          </div>
        </div>

        <button class="search-btn">搜尋</button>

        <button class="advanced-btn" @click="openAdvanced">
          進階搜尋
        </button>
      </div>
    </section>

    <!-- 主內容 -->
    <section class="map-section">
      <div class="map-container">
        <svg viewBox="0 0 1200 1400" xmlns="http://www.w3.org/2000/svg">
          <g v-for="loc in taiwan.locations" :key="loc.id">
            <path
              :d="loc.path"
              :data-name="loc.name"
              class="region"
              @click="selectRegion(loc)"
            />
          </g>
        </svg>
      </div>

      <div class="hotel-list">
        <h2>推薦飯店{{ selectedRegion ? ': ' + selectedRegion : '' }}</h2>
        <div v-if="hotels.length">
          <div
            v-for="(hotel, index) in hotels"
            :key="`${hotel.hotelName}-${index}`"
            class="hotel-card"
          >
            <img :src="hotel.photoUrl" alt="">
            <div>
              <h3>{{ hotel.hotelName }}</h3>
              <p>{{ hotel.district }} {{ hotel.city }}</p>
            </div>
          </div>
        </div>
        <p v-else class="empty">請點選地圖上的地區查看推薦飯店</p>
      </div>
    </section>

    <AdvancedSearchModal
      v-if="showAdvanced"
      :min="priceMin"
      :max="priceMax"
      :star="star"
      @close="closeAdvanced"
      @apply="applyAdvanced"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import taiwan from '@svg-maps/taiwan'
import AdvancedSearchModal from '@/administrant/components/AdvancedSearchModal.vue'
import UserNavbar from '@/administrant/components/UserNavbar.vue'
import { get } from '@/administrant/api/request'

const destination = ref('')
const checkIn = ref('')
const checkOut = ref('')
const guests = ref(1)
const showGuestBox = ref(false)

const showAdvanced = ref(false)
const priceMin = ref('')
const priceMax = ref('')
const star = ref('')

const selectedRegion = ref('')
const hotels = ref([])

const toggleGuestBox = () => {
  showGuestBox.value = !showGuestBox.value
}

const incrementGuest = () => {
  guests.value++
}

const decrementGuest = () => {
  if (guests.value > 1) {
    guests.value--
  }
}

const openAdvanced = () => {
  showAdvanced.value = true
}

const closeAdvanced = () => {
  showAdvanced.value = false
}

const applyAdvanced = (data) => {
  priceMin.value = data.min
  priceMax.value = data.max
  star.value = data.star
  showAdvanced.value = false
}

const regionNameMap = {
  'Taipei City': '台北市',
  'New Taipei City': '新北市',
  'Taoyuan City': '桃園市',
  'Taichung City': '台中市',
  'Tainan City': '台南市',
  'Kaohsiung City': '高雄市',
  'Keelung City': '基隆市',
  'Hsinchu City': '新竹市',
  'Chiayi City': '嘉義市',
  'Yilan County': '宜蘭縣',
  'Hsinchu County': '新竹縣',
  'Miaoli County': '苗栗縣',
  'Changhua County': '彰化縣',
  'Nantou County': '南投縣',
  'Yunlin County': '雲林縣',
  'Chiayi County': '嘉義縣',
  'Pingtung County': '屏東縣',
  'Taitung County': '台東縣',
  'Hualien County': '花蓮縣',
  'Penghu County': '澎湖縣',
  'Kinmen County': '金門縣',
  'Lienchiang County': '連江縣'
}

const selectRegion = async (loc) => {
  selectedRegion.value = regionNameMap[loc.name] || loc.name
  try {
    const data = await get('/api/recommended/hotel', {
      cityName: selectedRegion.value
    })
    hotels.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    console.error('fetch hotels error:', error)
    hotels.value = []
  }
}
</script>

<style scoped>
.booking-search {
  padding: 60px 0 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-bar {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
  max-width: 1000px;
  width: 90%;
}

.search-field {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 180px;
}

.search-field label {
  font-size: 0.9rem;
  color: #0f4d46;
  font-weight: 600;
  margin-bottom: 4px;
}

.search-field input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}

.search-btn,
.advanced-btn {
  background-color: #139898;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.advanced-btn {
  background: transparent;
  color: #139898;
  border: 1px solid #139898;
}

.advanced-btn:hover {
  background: #139898;
  color: #fff;
}

.map-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  padding-bottom: 60px;
}

.map-container svg {
  width: 550px;
  height: auto;
  cursor: pointer;
}

.region {
  fill: #d0f0ef;
  stroke: #0f4d46;
  stroke-width: 0.5;
  transition: fill 0.2s ease;
}

.region:hover {
  fill: #139898;
}

.hotel-list {
  min-width: 300px;
  margin-top: 30px;
}

.hotel-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  gap: 10px;
}

.hotel-card img {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.guest-box {
  position: relative;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}

.guest-popup {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  z-index: 10;
}

.guest-popup button {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}

.inputGuest {
  width: 60px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px;
}

.empty {
  color: #999;
  font-style: italic;
}
</style>

