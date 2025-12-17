<template>
  <div class="booking-summary-card">
    <div class="hotel-header">
      <img :src="`${path}?photoUrl=${hotelDetail.photoUrl}`" alt="酒店圖片" class="hotel-image" />
      <div class="hotel-info">
        <h3 class="hotel-name">{{ hotelDetail.hotelName }}</h3>
        <p class="location">
              📍
              {{ formatAddress }}
            </p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="summary-details">
      <div class="detail-block">
        <span class="detail-label">入住日期</span>
        <span class="detail-value">{{ searchData.checkInDate }}</span>
      </div>
      <div class="detail-block">
        <span class="detail-label">退房日期</span>
        <span class="detail-value">{{ searchData.checkOutDate}}</span>
      </div>
      <div class="detail-block">
        <span class="detail-label">總住宿晚數</span>
        <span class="detail-value">{{ night }} 晚</span>
      </div>
      <div class="detail-block">
        <span class="detail-label">您選擇的房客數</span>
        <span class="detail-value">{{ searchData.guestNumber }} 位旅客</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="room-summary">
      <h4 class="section-title">您選擇的商品</h4>
      <template v-for="(room, id) in roomDetail" :key="id">
      <p class="room-type">{{ room.name }}</p>
      <div class="price-per-room-row">
        <span>{{ rooms[room.roomId] }} 間房  x {{ night }} 晚</span>
        <span class="room-price">{{ room.price * rooms[room.roomId] }}</span>
      </div>
      </template>
    </div>
    <div class="discount" v-if="coupon!=null">
      <span>優惠卷折扣</span>
      <span>-{{ discount }}</span>
      </div>
    <div class="price-calculation">
      <div class="price-row total-price-row">
        <span class="label">價格總計</span>
          <span class="price">{{ totalPrice - (discount || 0) }}</span>
        </div>
    </div>
  </div> 
</template>

<script setup>
import { ref, computed } from 'vue';
const path = import.meta.env.VITE_PHOTO_URL;
const props = defineProps(['searchData', 'hotelDetail', 'roomDetail', 'rooms', 'night', 'coupon'])
const totalPrice = ref(0);
for (let roomDetail of props.roomDetail){
    totalPrice.value += roomDetail.price * props.rooms[roomDetail.roomId];
}
const discount = computed(() => props.coupon && props.coupon.discount ? props.coupon.discount : 0);

// 格式化地址：如果 address 已經包含城市名稱，就只顯示 address；否則組合顯示
const formatAddress = computed(() => {
  const { city, district, address } = props.hotelDetail;
  if (!address) return '';
  
  // 檢查 address 是否已經包含城市名稱（例如「台北市」、「新北市」、「高雄市」等）
  const cityNames = ['台北市', '新北市', '台中市', '台南市', '高雄市', '桃園市', '新竹市', '基隆市', '嘉義市', '臺北市', '臺中市', '臺南市'];
  const hasCityInAddress = cityNames.some(cityName => address.includes(cityName));
  
  // 如果 address 已經包含城市名稱，就只顯示 address
  if (hasCityInAddress) {
    return address;
  }
  
  // 否則組合顯示：城市 + 行政區 + 地址
  return (city || '') + (district || '') + address;
});

</script>

<style scoped>

.booking-summary-card {
  width: 100%;
  max-width: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

/* --- 1. 酒店名稱與圖片 --- */
.hotel-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.hotel-image {
  width: 100px;
  height: 67px; /* 典型的 3:2 比例 */
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
  flex-shrink: 0;
}

.hotel-info {
  flex-grow: 1;
}

.hotel-name {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 4px 0;
}

.hotel-rating {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.score {
  background-color: #003580; /* Booking.com 藍色 */
  color: white;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px 4px 4px 0;
  margin-right: 8px;
}

.label {
  color: #000;
  font-weight: 600;
}

/* --- 2. 預訂摘要 --- */
.summary-details {
  margin-bottom: 24px;
}

.detail-block {
  display: flex;
  justify-content: space-between;
  line-height: 1.4;
  margin-bottom: 8px;
}

.detail-label {
  color: #6b6b6b;
  font-size: 14px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* --- 3. 房型與價格 --- */
.room-summary {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.room-type {
  font-size: 14px;
  color: #003580;
  font-weight: 600;
  margin-bottom: 8px;
}

.price-per-room-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.room-price {
  font-weight: 600;
}

/* --- 4. 價格總計 --- */
.price-calculation {
  border-top: 2px solid #ddd;
  padding-top: 24px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total-price-row {
  font-size: 20px;
  font-weight: 700;
  color: #000;
}
.discount {
  display:flex;
  justify-content:space-between;
  text-align:right;
  color:red;
}



/* 通用分隔線 */
.divider {
  border-top: 1px solid #e0e0e0;
  margin: 16px 0;
}
</style>