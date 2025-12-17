<template>
    <main class="content">
        <SearchBar 
        v-model:searchData="searchData"
        @searchHotel="searchHotel"
        @openAdvanced="openAdvanced"
        :keywordMessage="keywordMessage"
        :checkInDateMessage="checkInDateMessage"
        :checkOutDateMessage="checkOutDateMessage"
        :guestsMessage="guestsMessage"
        @goToMap="goToMap"></SearchBar>

        <div class="results-header">
        <ProductSelectSort 
             :total="totalElement"
             :options="[2, 4, 6, 8, 10]" 
             :sortOptions="sortOptions"
             v-model:sortField = "sortField"
             v-model="size"
             :sortOrderOptions="sortOrderOptions"
             v-model:sortOrder="sortOrder"
            @selectChange="searchHotel"
            @changeSort="onSortChange"></ProductSelectSort>
        <Paginate
                v-model="page"
                :page-count="pageCount"
                :page-range="3"
                :margin-pages="1"
                :click-handler="searchHotel"
                :prev-text="'&lsaquo;'"
                :next-text="'&rsaquo;'"
                :container-class="'pagination'">
            </Paginate>

            </div>
      <div class="hotel-grid">
      <div v-for="hotel in hotels" :key="hotel.hotelId" class="hotel-card">
          <HotelCard :hotel="hotel" @hotelSelected="getHotelDetail"
          :isFavorite="favoriteComposable.isFavorite(hotel.hotelId)"
          @toggleFavorite="favoriteComposable.handleFavorite"></HotelCard>
      </div>
      </div>
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
    </main>
  
</template>



<script setup>
import Paginate from "vuejs-paginate-next"
import { ref, onMounted, reactive } from "vue";
import useUserStore from "@/user/stores/user.js"
const userStore = useUserStore();
import useHotelStore from "@/user/stores/hotel.js"
import myAxios from "@/user/plugin/axios";
import HotelCard from "@/user/components/HotelCard.vue";
import {useRouter} from 'vue-router';
import useWishlist from '@/user/composables/useWishlist.js';
import SearchBar from "@/user/components/SearchBar.vue";
import AdvancedSearchModal from "@/user/components/AdvancedSearchModal.vue";
import ProductSelectSort from "@/user/components/ProductSelectSort.vue";
const favoriteComposable = useWishlist();
const router = useRouter();
const hotelStore = useHotelStore();
let hotels = ref([]);
let searchData = ref(hotelStore.searchData);

//排序參數
const sortOptions = ref([
  { label: '價格', value: 'price' },
  { label: '評分', value: 'rating' },
  { label: '房間容納人數', value: 'maxOccupancy' },
  { label: '星級', value: 'starrating'}
])
const sortOrderOptions = ref([
  { label: '高到低', value: 'desc'},
  { label: '低到高', value: 'asc'}
])
const sortOrder = ref("asc");
const sortField = ref("maxOccupancy");
//分頁參數
const size = ref(10);
const page = ref(1);
const totalElement = ref(0);
const pageCount = ref(0);

// 錯誤訊息
let keywordMessage = ref("");
let checkInDateMessage = ref("");
let checkOutDateMessage = ref("");
let guestsMessage = ref("");

onMounted(() => {
  searchHotel();
})

function onSortChange() {
  searchData.value.sortBy = sortField.value;
  searchData.value.sortOrder = sortOrder.value;
  page.value = 1; // 回到第一頁
  searchHotel();
}

//查詢飯店
function searchHotel(pageNumber) {
  if (pageNumber) {
    page.value = pageNumber;
  }

  searchData.value.page = page.value - 1;
  if (searchData.value.page < 0) {
    searchData.value.page = 0;
  }
  searchData.value.size = size.value;
  console.log(searchData);
  myAxios({
    method: 'get',
    url: '/api/searchHotel',
    params: searchData.value,
  })
  .then(response => {
    console.log(response);
    hotelStore.setSearchData(searchData.value)
    if (response.data.length == 0){
      totalElement.value = 0;
    } else {
      totalElement.value = response.data.totalElement;
    }
    hotels.value = response.data.searchResults;
    pageCount.value = Math.ceil(totalElement.value/size.value);
    //頁數超過最大頁重新搜尋
     if (page.value > pageCount.value) {
      page.value = pageCount.value;
      searchData.value.page = page.value - 1;
      return searchHotel();
    }
  })
  .catch(error => {
    console.log(error);
    keywordMessage.value = error.response.data.keyword;
    checkInDateMessage = error.response.data.checkInDate;
    checkOutDateMessage = error.response.data.checkOutDate;
    guestsMessage = error.response.data.guestNumber;
  });
}

  function getHotelDetail(hotelId) {
    console.log(hotelId);
    router.push(`/user/hotelInfo/${hotelId}`);
  }

onMounted(() => {
  if (userStore.token.length != 0){
    favoriteComposable.initializeFavorite();
  }
})

// 進階搜尋modal
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
  searchHotel();
}
function goToMap(){
  router.push("mapPicker");
}

</script>



<style scoped>

/* ======== 內容區 ======== */
.content {
  padding: 20px 28px;
  min-height: 100vh;
}
.results-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 25px;
    padding: 15px 20px;
    background: white;

}

.hotel-card {
  width: 100%;
}
.hotel-grid {
  padding: 60px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); /* 每個卡片最小 300px，寬度自適應 */
  gap: 30px; /* 卡片間距 */
  /* align-items: stretch; */
}


</style>
