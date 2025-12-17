  <template>
    <div class="hotel-detail-page" v-if="!isLoading">
      <main class="content-wrapper">
        <section class="main-info">
          <!-- //顯示照片 -->
          <Gallery :photos></Gallery>
          <!-- 飯店基本資料 -->
          <div class="hotel-summary">
            <h2 class="hotel-name">{{ hotelDetail.hotelName }}
              <button class="favorite-btn" @click="toggleFavorite(hotelDetail.hotelId)">
                <span v-if="wishlistComposable.isFavorite(hotelDetail.hotelId)">❤️</span>
                <span v-else>🤍</span>
              </button>
            </h2>
              
            
              <div class="rating-badge">
              
                <!-- //地址 -->
                <p class="location">
                📍
                {{ formatAddress }}
              </p>

              <div class="description-section">
            <span class="icon">🔗</span> 
            <a 
                :href="hotelDetail.description" 
                target="_blank" 
                @click.stop 
                class="hotel-link"
            >
                查看官方網站
              </a>
            </div>
              <!-- 評論、平均分數 -->
              <div class="thumbs-up-icon-wrapper">
                <span v-for="n in 5" :key="n" >
                  <ThumpUpIcon :color="n <= hotelDetail.avgRating ? '#0f4d46' : '#cccccc'"
                                class="thumb-up-icon">
                  </ThumpUpIcon>
                </span>
                <span class="avg-rating" v-if="hotelData.review.length != 0">{{ hotelDetail.avgRating.toFixed(1)}} / 5.0</span>
                <span class="review-count"> ({{ hotelData.review.length }} 則評論)</span>
              </div>  

              <div v-if="hotelData.review.length!=0">
              <Review :reviews
              :hotelDetail></Review>
              </div>
            </div>
          </div>
        </section>
        <div class="facility-list-summary">
          <h3>飯店設施&服務</h3>
          <span v-for="(item, index) in hotelData.facilities" :key="index" class="facility-tag">
            {{ item.facility }}
          </span>
        </div>

        <!-- 房型 -->
<div class="room-header">
  <h3>🏠 可選房型</h3>
  <div class="hotel-search-panel">
    <div class="search-field">
      <label>入住日期</label>
      <input type="date" v-model="checkInDate">
    </div>

    <div class="search-field">
      <label>退房日期</label>
      <input type="date" v-model="checkOutDate">
    </div>

    <div class="search-field">
      <label>人數</label>
      <div class="guest-box" @click="toggleGuestBox">
        {{ guestNumber }} 位旅客
        <div v-if="showGuestBox" class="guest-popup">
          <button @click.stop="decrementGuest">-</button>
          <input class="inputGuest" :value="guestNumber" disabled />
          <button @click.stop="incrementGuest">+</button>
        </div>
      </div>
    </div>
    <button class="search-btn" @click="fetchHotel">搜尋</button>
  </div>
</div>
<div v-if="rooms.length > 0">
<HotelRoom :rooms="rooms"></HotelRoom>
</div>
  <div v-else class="no-rooms-message">
    <h4>🥺 很抱歉，此期間暫無可預訂房型。</h4>
  </div>
      </main>
    </div>
  </template>

  <script setup>
  import ThumpUpIcon from '@/user/components/icons/ThumpUpIcon.vue'
  import myAxios from "@/user/plugin/axios";
  import { ref, onMounted, computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import useHotelStore from "@/user/stores/hotel.js"
  import Gallery from "@/user/components/Gallery.vue";
  import Review from "@/user/components/Review.vue"
  import HotelRoom from "@/user/components/HotelRoom.vue";
  import useWishlist from "@/user/composables/useWishlist.js";
  const wishlistComposable = useWishlist();
  const route = useRoute();
  const hotelStore = useHotelStore();
  const checkInDate = ref(hotelStore.searchData.checkInDate);
  const checkOutDate = ref(hotelStore.searchData.checkOutDate);
  const guestNumber = ref(hotelStore.searchData.guestNumber);

  let hotelData = ref({review:[]});
  let photos = ref([]);
  let hotelDetail = ref({avgRating:0});
  let reviews = ref([]);
  let rooms = ref([]);
  let isLoading = ref(true);
  let isFavorite = ref(false);

  // 格式化地址：如果 address 已經包含城市名稱，就只顯示 address；否則組合顯示
  const formatAddress = computed(() => {
    const { city, district, address } = hotelDetail.value;
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

  function toggleFavorite(hotelId){
    console.log("beforeToggle" + isFavorite.value);
    wishlistComposable.handleFavorite(hotelId, isFavorite.value);
    isFavorite.value = !isFavorite.value;

  }

  onMounted(() => {
    wishlistComposable.initializeFavorite();
    fetchHotel();
  })
  const searchData = hotelStore.searchData;
  function fetchHotel(){
    searchData.checkInDate = checkInDate.value;
    searchData.checkOutDate = checkOutDate.value;
    searchData.guestNumber = guestNumber.value;
    console.log(searchData);
     myAxios({
      method: 'get',
    url: '/api/hotels/hotelInfo',
    params: {
      hotelId: route.params.hotelId,
      checkInDate: hotelStore.searchData.checkInDate,
      checkOutDate:hotelStore.searchData.checkOutDate,
      guestNumber:hotelStore.searchData.guestNumber
    }
  })
    .then(response => {
      console.log(response);
      hotelData.value = response.data;
      photos.value = response.data.photos;
      hotelDetail.value = response.data.hotelDetail;
      reviews.value = response.data.review;
      rooms.value = response.data.roomInfo;
      hotelStore.setHotelDetail(hotelDetail.value);
      isFavorite.value = wishlistComposable.isFavorite(hotelDetail.value.hotelId);
    })
    .catch(error => console.log(error))
    .finally(() => {
      isLoading.value = false;
    })
  }

  //人數選擇
  const showGuestBox = ref(false);
  function toggleGuestBox() {
  showGuestBox.value = !showGuestBox.value;
}

function incrementGuest() {
  guestNumber.value++;
}

function decrementGuest() {
  if (guestNumber.value > 1) {
    guestNumber.value--;
  }
}

  </script>

  <style scoped>
    .main-info {
      margin-top: 50px;
      display: flex;
      gap: 100px;
      align-items: flex-start;
    }


  .hotel-detail-page {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: var(--text-color);
    max-width: 1200px;
    margin: 50px  auto ;
    padding-bottom: 50px;
  }

  /* --- 主要內容區 --- */
  .content-wrapper {
    padding: 0 20px;
  }


  .hotel-summary {
    flex: 1;
    flex-direction: column;
    padding: 15px 0;
  }

  .hotel-name {
    color: var(--primary-color);
    font-size: 2.2em;
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 10px;
    position: relative;
  }

.description-section {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    margin-bottom: 10px;
}

.thumb-up-icon {
  width: 20px;
  height: 20px;
  margin: 0 2px;
}

  .rating-badge {
    margin-bottom: 15px;
    font-size: 1.1em;
  }

  .star-rating .star {
    color: #ccc;
    margin-right: 2px;
  }

  .star-rating .filled {
    color: #ffc107; /* 金色星星 */
  }

  .avg-rating {
    font-weight: bold;
    color: var(--primary-color);
    margin-left: 5px;
  }

  .review-count {
    font-size: 0.9em;
    color: #666;
  }

  .location {
    margin-bottom: 20px;
    font-size: 1em;
    line-height: 1.5;
  }

  .facility-list-summary {
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 15px;
    border-top: 1px solid rgba(128, 128, 128, 0.374);
    margin-top: 15px;
  }

  .facility-tag {
    background-color: rgb(167, 235, 167);
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    margin-right:5px;
    gap: 5px;
  }

    .hotel-name .favorite-btn {
    border: none;
    position: absolute;
    top: 5px;
    z-index: 2;
    cursor: pointer;
    background: transparent;
    font-size: 25px;
  }
  .favorite-btn .favorite-btn:hover {
    transform: scale(1.2);
  }

  /* 搜尋欄位 */

.room-header {
  margin-top: 15px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(128, 128, 128, 0.374); /* 改到這裡 */
}
.hotel-search-panel {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: #fff;
  align-items: flex-end;
}

.search-field {
  display: flex;
  flex-direction: column;
}

.search-field label {
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.search-field input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.guest-box {
  border: 1px solid #ccc;
  padding: 6px 10px;
  border-radius: 6px;
  position: relative;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 10;
}

.inputGuest {
  width: 100px;
  text-align: center;
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
.search-btn {
  padding: 8px 18px;
  background: rgb(152, 236, 152);
  color: black;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.no-rooms-message {
  margin-top: 30px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background-color: #fff3cd; /* 輕微的警告色背景 */
  color: #856404;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.thumbs-up-icon-wrapper {
  margin-bottom: 10px;
}
  </style>