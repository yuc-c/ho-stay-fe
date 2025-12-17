<template>
  <div class="booking-container" v-if = !isLoading>
    <h2 class="page-title">📝 預訂資料填寫</h2>
    <div class="row">
      <div class="col-4">
      <BookingRoomCard 
        :searchData = searchData
        :hotelDetail = hotelDetail
        :roomDetail = roomDetail
        :rooms="rooms"
        :night="night"
        :coupon="coupon"></BookingRoomCard>
      </div>
      <div class="col-8">
        <OrderForm :bookingInventoriesDto = bookingInventoriesDto
                    :roomDetail = roomDetail
                    v-model = "coupon"></OrderForm>
      </div>
      </div>  
    </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import myAxios from '@/user/plugin/axios'
import useHotelStore from '@/user/stores/hotel.js'
import { useRoute } from 'vue-router';
import BookingRoomCard from '@/user/components/BookingRoomCard.vue';
import OrderForm from '@/user/components/OrderForm.vue';
const route = useRoute();
const hotelStore = useHotelStore();
const hotelDetail = hotelStore.hotelDetail;
const searchData = hotelStore.searchData;
const night = hotelStore.night;
const bookingInventoriesDto = ref([]);
const coupon = ref(null);
let rooms = ref({});
let roomIds = ref([]);
let roomDetail = ref([]);
let isLoading = ref(true);
console.log(searchData);
console.log(hotelDetail);
console.log(roomDetail);
//取得roomId並轉成陣列
rooms.value = JSON.parse(route.query.rooms);
const roomIdsString = Object.keys(rooms.value);
for (let i = 0; i < roomIdsString.length; i++){
  if (rooms.value[roomIdsString[i]] > 0){
    roomIds.value[i] = parseInt(roomIdsString[i]);
  }
}
//查詢房間資訊
onMounted(() => {
  console.log("roomIds" + roomIds);
  myAxios({
    method: 'get',
    url: '/api/rooms/roomDetail',
    params: {
      roomIds: roomIds.value,
      checkInDate: hotelStore.searchData.checkInDate,
      checkOutDate:hotelStore.searchData.checkOutDate,
    }
  })
    .then(response => {
      console.log(response);
      roomDetail.value = response.data;
      bookingInventoriesDto.value = createBookingInventory();
      console.log(bookingInventoriesDto.value);
  })
      
    .catch(error => console.log(error))
    .finally(() => isLoading.value = false);
})

function createBookingInventory(){
  let result = [];
for (const roomId in rooms.value) {
  const quantity = rooms.value[roomId];
  if (quantity > 0){
    const room = roomDetail.value.find(r => r.roomId === Number(roomId));
    for (let inventoryId of room.inventoryIds) {
      result.push({
        inventoryId,
        number: quantity
      })
    }
  }
}
return result;
}



</script>
<style scoped>
/* 基礎佈局 */
.booking-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.page-title {
  text-align: center;
  color: #333;
  /* 標題底線：湖水綠 */
  border-bottom: 2px solid #00a896; 
  padding-bottom: 10px;
  margin-bottom: 20px;
}

</style>