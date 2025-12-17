<template>
  <div class="favorite-list-container">
    <h2 class="title">我的收藏</h2>

    <div v-if="!favorites || favorites.length === 0" class="empty">
      <p>您目前沒有收藏任何飯店喔！</p>
      <p>快去探索您喜歡的住宿吧。</p>
    </div>
    <div v-else>
      <div class="pagination-select">
      <ProductSelect 
             :total="totalElement"
             :options="[4, 6, 8, 10]"
             v-model="size"
            @selectChange="changeSize"
            ></ProductSelect>
        <Paginate
        v-model="currentPage"
        :page-count="page"
        :page-range="3"
        :margin-pages="1"
        :click-handler="changePage"
        :prev-text="'&lsaquo;'"
        :next-text="'&rsaquo;'"
        :container-class="'pagination'">
    </Paginate>
    </div>

    <ul class="list"> 
      <li
        v-for="hotel in favorites"
        :key="hotel.hotelId"
        class="item"
        @click="selectHotel(hotel)" 
      >
      <img :src="`${path}?photoUrl=${hotel.photoUrl}`" :alt="hotel.name" class="thumb" />

      <div class="info">
        <h3 class="name">{{ hotel.name }}</h3>
    
        <p class="location">
            <span class="icon">📍</span> 
            {{ hotel.city }}{{ hotel.district }}
        </p>

        <div class="star-rating">
            <span class="icon">⭐️</span> 
            <span class="star-text">{{ hotel.starRating }}星級飯店</span>
            <span v-if="hotel.starRating" class="stars">
                {{ '★'.repeat(hotel.starRating) }}
            </span>
        </div>
        <div class="description-section">
            <span class="icon">🔗</span> 
            <a 
                :href="hotel.description" 
                target="_blank" 
                @click.stop 
                class="hotel-link"
            >
                查看官方網站
            </a>
        </div>

      </div>
  
          <button class="remove-btn" @click.stop="remove(hotel.id)" title="從收藏移除">
            ✕
          </button>
      </li>
    </ul>
    </div>
  </div>
</template>

<script setup>
import ProductSelect from "@/user/components/ProductSelect.vue";
import Paginate from "vuejs-paginate-next";
import {ref, onMounted, nextTick} from "vue";
import useWishlist from "@/user/composables/useWishlist.js";
const path = import.meta.env.VITE_PHOTO_URL;
const wishlist = useWishlist();
const currentPage = ref(1);
const size = ref(6);
const page = wishlist.page;
const favorites = wishlist.favorites;
const totalElement = wishlist.totalElements;

function changePage(newPage) {
  wishlist.favoriteList(newPage- 1, size.value);
}
function changeSize() {
  currentPage.value = 1;
  wishlist.favoriteList(currentPage.value - 1, size.value);
}


onMounted(() => {
  wishlist.favoriteList(currentPage.value - 1, size.value);

})

function remove(id) {
  wishlist.removeFavoriteAndRefresh(id, currentPage.value - 1, size.value)
}

</script>

<style scoped>
/* 頁面容器 */
.favorite-list-container {
  max-width: 1200px; /* 增加最大寬度，以容納 3 欄 */
  margin: 0 auto;
  padding: 20px;
}

/* 主標題 */
.title {
  font-size: 2rem;
  margin-bottom: 25px;
  font-weight: 700;
  color: #333;
  /* 將底線顏色改為淺綠色 */
  border-bottom: 2px solid #A5D6A7; /* 淺綠色 */
  padding-bottom: 10px;
}

/* 列表為空時的提示 */
.empty {
  padding: 60px 0;
  text-align: center;
  color: #999;
  font-size: 1.1rem;
  line-height: 1.8;
  border: 1px dashed #ddd;
  border-radius: 10px;
  margin-top: 20px;
}

/* 🏆 關鍵修改：列表容器使用 CSS Grid 實現三列佈局 🏆 */
.list {
  display: grid;
  /* 設置網格模板：自動適應，最小寬度 280px，最大寬度 1fr (均分空間) */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px; /* 項目之間的間距 */
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 列表項目：現在是一個垂直堆疊的卡片 */
.item {
  display: flex;
  flex-direction: column;
  padding: 0; /* 保持這個 0，讓 info 處理內容 padding */
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: relative; 
  overflow: hidden;
}

.item:hover {
  background: #f0f8ff;
  border-color: #b3d4fc;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 飯店圖片：作為卡片頂部封面 */
.thumb {
  width: 100%; /* 圖片寬度填滿卡片 */
  height: 200px; /* 設置固定高度 */
  object-fit: cover;
  /* 頂部圓角與卡片保持一致 */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* 資訊區塊：作為卡片底部內容 */
.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 15px;
  flex-grow: 1; 
  /* 讓 info 內部內容頂部對齊，將額外空間保留在底部，以維持卡片高度一致性 */
  justify-content: flex-start; 
}

/* 飯店名稱 */
.name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 地點資訊 */
.location {
  font-size: 0.95rem;
  color: #6a6a6a;
  margin: 0;
}

/* 評分資訊 */
.rating {
  font-size: 1rem;
  color: #ff9800;
  font-weight: 500;
  margin: 0;
}

.star-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    margin-bottom: 5px; 
}
.star-rating .star-text {
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
}

.star-rating .stars {
    color: #ffc107; /* 金色星星 */
    font-size: 1.1rem;
    line-height: 1;
}

/* 移除按鈕：定位在卡片的右上角 */
.remove-btn {
  position: absolute; /* 絕對定位 */
  top: 10px;
  right: 10px;
  border: none;
  background-color: rgba(255, 255, 255, 0.8); /* 略透明背景 */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.remove-btn:hover {
  color: #e53935;
  background-color: #fff;
  transform: scale(1.1);
}

.pagination-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap:15px
}
/* 連結 */
.description-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    /* 使用較重的分隔線，與 tag-section 區隔 */
    border-top: 1px solid #e9ecef; 
}

.hotel-link {
    font-size: 0.95rem;
    color: #4CAF50; /* 🏆 主題綠色 (Material Green 500) 🏆 */
    text-decoration: none;
    transition: color 0.2s;
}

.hotel-link:hover {
    color: #0056b3;
    text-decoration: underline; /* 懸停時顯示下劃線 */
}
</style>