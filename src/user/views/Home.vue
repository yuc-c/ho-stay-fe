<template>
  <UserNavbar />

  <SearchBar 
        v-model:searchData="searchData"
        @searchHotel="searchHotel"
        @openAdvanced="openAdvanced"
        :keywordMessage="keywordMessage"
        :checkInDateMessage="checkInDateMessage"
        :checkOutDateMessage="checkOutDateMessage"
        :guestsMessage="guestsMessage"
        @goToMap="goToMap"></SearchBar>
<!-- 優惠卷廣告 -->
<div class="promotion-banner container">
    <div class="carousel-content">
        <div
            @click.stop="prevBanner" 
            class="coupon-action-link left-arrow">
            ◀ </div>

        <div 
            class="coupon-highlight-text"
            @click="handleBannerClick(promoBanners[currentBannerIndex])" 
            :key="promoBanners[currentBannerIndex].id">
              <span class="name">🎉 {{ promoBanners[currentBannerIndex].name }} </span>
              <span class="discount"> 消費滿{{ promoBanners[currentBannerIndex].minimum }}輸入優惠碼{{ promoBanners[currentBannerIndex].sn }}現折{{ promoBanners[currentBannerIndex].discount }} </span>
              <div class="time">優惠期限:{{ promoBanners[currentBannerIndex].startTime }}-{{ promoBanners[currentBannerIndex].endTime }}</div>
        </div>

        <div 
            @click.stop="nextBanner" 
            class="coupon-action-link right-arrow">
            ▶ </div>
    </div>
  </div>

  <!-- 主內容：地圖 + 推薦飯店 -->
  <section class="map-section">
    <div class="map-container">
      <svg
        viewBox="0 0 1200 1400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g v-for="loc in taiwan.locations" :key="loc.id">
          <path
            :d="loc.path"
            :data-name="loc.name"
            class="region"
            @click="select(loc)"
          />
        </g>
      </svg>
    </div>

    <!-- 推薦飯店 -->
    <div class="hotel-list">
      <h2>推薦飯店{{ selectedRegion ? ': ' + selectedRegion : '' }}</h2>
      <div v-if="hotels">
        <div
          v-for="(hotel, index) in hotels"
          :key="index"
          class="hotel-card" @click="getHotelDetail(hotel.hotelId)">
          <img :src='`${path}?photoUrl=${hotel.photoUrl}`' alt="">
          <div>
            <h3>{{ hotel.hotelName }}</h3>
            <p>{{ hotel.district }} {{ hotel.city }}</p>
          </div>
          <button class="favorite-btn" @click.stop="wishlist.handleFavorite(hotel.hotelId, wishlist.isFavorite(hotel.hotelId))">
            <span v-if="wishlist.isFavorite(hotel.hotelId)">❤️</span>
            <span v-else>🤍</span>
          </button>
        </div>
      </div>
      <p v-else class="empty">請點選地圖上的地區查看推薦飯店</p>
    </div>
  </section>
  
  <AdvancedSearchModal
          v-if="showAdvanced"
          @close="closeAdvanced"
          @apply="applyAdvanced"
            :filterData="{
            minPrice: searchData.minPrice,
            maxPrice: searchData.maxPrice,
            star: searchData.starRating,
            hotelTypes: searchData.hotelTypes,
            facilities: searchData.facilities
          }">
        </AdvancedSearchModal>

</template>

<script setup>
const path = import.meta.env.VITE_PHOTO_URL;
import SearchBar from '@/user/components/SearchBar.vue';
import UserNavbar from '@/user/Navbar/UserNavbar.vue'
import taiwan from '@svg-maps/taiwan'
import { onMounted, ref } from 'vue'
import myAxios from '@/user/plugin/axios.js'
import AdvancedSearchModal from '@/user/components/AdvancedSearchModal.vue'
import useHotelStore from '@/user/stores/hotel.js'
import { useRouter } from 'vue-router'
import useWishlist from '@/user/composables/useWishlist.js';
const wishlist = useWishlist();
const hotelStore = useHotelStore();
const router = useRouter();
// 錯誤訊息
let keywordMessage = ref("");
let checkInDateMessage = ref("");
let checkOutDateMessage = ref("");
let guestsMessage = ref("");

//優惠卷
const currentBannerIndex = ref(0);
const promoBanners = ref([
    { id: 1, text: '🎉 限時活動：註冊/登入領取 $500 優惠券！', link: '/user/promotions' },
    { id: 2, text: '💰 本週熱門飯店：最高享 8 折優惠！', link: '/user/hot-deals' },
    { id: 3, text: '🌟 五星好評！評論再送 $100 回饋金！', link: '/user/reviews' }
]);

function fetchCoupon() {
  myAxios({
    method:'get',
    url:'/api/coupons/valid'
  })
  .then(response => {
    console.log(response);
    promoBanners.value = response.data;

  })
  .catch(error => {
    console.log(error);
  })
}

// 輪播方法：跳到下一張 (Next)
function nextBanner() {
    const nextIndex = (currentBannerIndex.value + 1) % promoBanners.value.length;
    currentBannerIndex.value = nextIndex;
}

// ✨ 新增：輪播方法：跳到前一張 (Previous)
function prevBanner() {
    const prevIndex = (currentBannerIndex.value - 1 + promoBanners.value.length) % promoBanners.value.length;
    currentBannerIndex.value = prevIndex;
}
// 點擊事件：用於導航或執行特定動作
function handleBannerClick(banner) {
    if (banner.link) {
        // 使用 .stop 阻止事件冒泡到整個橫幅，所以這裡導航可以寫在箭頭的點擊事件中
        // 但為了點擊橫幅任何地方都能導航，我們還是保留點擊橫幅的導航邏輯
        router.push(banner.link);
    }
}


//搜尋參數

let today = ref(new Date().toISOString().split("T")[0]);
let tomorrow = ref(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
);
const searchData = ref({
    keyword: '',
    checkInDate: today.value,
    checkOutDate: tomorrow.value,
    guestNumber: 2,
    size: 5,
});

console.log(searchData.value);


//收藏按鈕
onMounted(() => {
  wishlist.initializeFavorite();
  fetchCoupon();
})



//點擊搜尋按鈕查詢飯店
function searchHotel() {
  console.log(searchData.value);
  myAxios({
    method: 'get',
    url: '/api/searchHotel',
    params: searchData.value,
  })
    .then(response => {
      console.log(response);
      hotelStore.setSearchData(searchData.value);
      router.push("/user/searchResult");
    })
    .catch(error => {
      console.log(error);
      keywordMessage.value = error.response.data.keyword;
      checkInDateMessage = error.response.data.checkInDate;
      checkOutDateMessage = error.response.data.checkOutDate;
      guestsMessage = error.response.data.guestNumber;
    });
}

// 狀態
const selectedRegion = ref('')
const hotels = ref([]);
// 地圖操作
function select(loc) {
  selectedRegion.value = regionNameMap[loc.name];
  myAxios({
  method: 'get',
  url: '/api/hotels/recommended',
  params: {
    cityName: selectedRegion.value
  }
})
  .then(response => {
    console.log(response);
    hotels.value = response.data;
  })
  .catch(error => console.log(error));
}


const regionNameMap = {
  "Taipei City": "台北市",
  "New Taipei City": "新北市",
  "Taoyuan City": "桃園市",
  "Taichung City": "台中市",
  "Tainan City": "台南市",
  "Kaohsiung City": "高雄市",
  "Keelung City": "基隆市",
  "Hsinchu City": "新竹市",
  "Chiayi City": "嘉義市",
  "Yilan County": "宜蘭縣",
  "Hsinchu County": "新竹縣",
  "Miaoli County": "苗栗縣",
  "Changhua County": "彰化縣",
  "Nantou County": "南投縣",
  "Yunlin County": "雲林縣",
  "Chiayi County": "嘉義縣",
  "Pingtung County": "屏東縣",
  "Taitung County": "台東縣",
  "Hualien County": "花蓮縣",
  "Penghu County": "澎湖縣",
  "Kinmen County": "金門縣",
  "Lienchiang County": "連江縣"
}
const showAdvanced = ref(false);
    function openAdvanced() {
      showAdvanced.value = true;
    }
    function closeAdvanced() {
      showAdvanced.value = false;
    }

function applyAdvanced(filterData) {
  searchData.value.minPrice = filterData.minPrice
  searchData.value.maxPrice = filterData.maxPrice
  searchData.value.starRating = filterData.star
  searchData.value.hotelTypes = filterData.hotelTypes
  searchData.value.facilities = filterData.facilities
  showAdvanced.value = false;
  console.log("=== 套用進階搜尋 ===")
  console.log("最低:", filterData.minPrice)
  console.log("最高:", filterData.maxPrice)
  console.log("星級:", filterData.star)
}

  function getHotelDetail(hotelId) {
    console.log(hotelId);
    router.push(`/user/hotelInfo/${hotelId}`);
  }
function goToMap(){
  router.push("user/mapPicker");
}

</script>

<style scoped>

/* 地圖與飯店主區 */
.map-section {
  display: flex;
  justify-content: center;
  gap: 40px;
}

/* 地圖 */
svg {
  width: 550px;
  height: auto;
  cursor: pointer
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

/* 飯店區 */
.hotel-list {
  min-width: 300px;
  margin-top: 30px;
}

.hotel-list h2 {
  color: #0f4d46;
  margin-bottom: 20px;
}

.hotel-card {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  gap: 10px;
}

.hotel-card img {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.hotel-card h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #139898;
}
.hotel-card:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.247);
}


.empty {
  color: #999;
  font-style: italic;
}
.favorite-btn {
  border: none;
  position: absolute;
  right: 0px;
  top:0px;
  z-index: 2;
  cursor: pointer;
  background: transparent;
}
.favorite-btn:hover {
   transform: scale(1.2);
}

.map-btn {
  display: inline-block;
  padding: 10px 18px;
  background-color: #139898;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.25s;
  font-weight: 600;
  margin-bottom: 12px;
}

/* ✨ 輪播點容器 */
.carousel-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px; /* 內邊距，防止箭頭貼邊 */
}

/* 優惠券文字區塊 (確保文字在 Flex 佈局中佔據空間並居中) */
.coupon-highlight-text {
    text-align: center; /* 確保文字居中 */
    font-size: 1.2rem;
    font-weight: 700;
    flex-wrap: wrap;
    /* border: 1px solid black; */
    width: 800px;
}

.coupon-highlight-text span {
    color: #000000;
}

.promotion-banner {
    max-width: 1200px; /* 寬度限制 */
    margin: 10px auto 10px auto; /* 上下外邊距 */
    padding: 15px 10px; /* 內邊距 */
}


/* 確保橫幅本身有 Pointer 樣式 */
.promotion-banner .coupon-highlight {
    cursor: pointer;
}

/* 箭頭通用樣式 (微調以適應 < 和 > 符號) */
.coupon-action-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    color: #0f4d46;
    border-radius: 50%;
    text-decoration: none;
    font-size: 1.8rem; /* 放大箭頭 */
    font-weight: 900;
    line-height: 1; 
    cursor: pointer;
    user-select: none; /* 防止選中箭頭符號 */
    flex-shrink: 0; /* 確保箭頭不會被文字推擠變形 */
    font-size: 1em;
    margin: 0 5px;
}

.coupon-action-link:hover {
    background-color: #c1f3e0;
    transform: scale(1.1);
}
.coupon-highlight-text .name {
  margin: 0 10px;
  color: rgb(230, 59, 59);
}
.coupon-highlight-text .discount {
  margin: 0 10px;
  color: rgb(230, 59, 59);
}
.coupon-highlight-text .time {
  margin: 0 10px;
  font-size: 0.8em;
  color: rgb(230, 59, 59);
}


</style>
