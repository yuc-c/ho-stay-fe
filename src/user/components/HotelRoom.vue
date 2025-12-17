<template>
        <section class="room-booking-section">
        
        <div v-for="room in rooms" :key="room.roomId" class="room-card">
          <div class="room-details">
            <h5>{{ room.roomName }} ({{ room.roomType }})</h5>
            <p>
              坪數: {{ room.roomSize.toFixed(0) }} 平方公尺 
            </p>
            <p>
              🛏️
              {{ room.bedNumber }} 張 {{ room.bedType }}
            </p>
            <p>
              👥
              最多入住 {{ room.maxOccupancy }} 人
            </p>
          </div>
          <div class="room-price-action">
            <div class="price-box">
              <span class="currency">TWD</span>
              <span class="price">{{ room.partPrice.toLocaleString() }}</span>
              <span class="unit">/ {{room.night}}晚</span>
            </div>
            <p class="stock-info">
              <span v-if="room.stock > 0" class="in-stock">僅剩 {{ room.stock }} 間</span>
              <span v-else class="out-stock">已滿房</span>
            </p>
            <select name="selectedNumber" 
                    class="selected-number"
                    v-model="roomSelectedNumber[room.roomId]">
                <option value="0">0</option>
                <template v-for="i in room.stock" :key="i">
                <option :value="i">{{ i }}</option>
                </template>
            </select>
          </div>
        </div>
        
        <p class="total-price">總價為:{{totalPrice.toLocaleString()}}</p>
        <div class="booking-btn-container">
        <button class="btn booking-btn" @click="handleReserve">預訂</button>
        </div>
      </section>
</template>
    
<script setup>
    import { ref, computed } from 'vue';
    import {useRouter} from 'vue-router'
    import useBookingStore from '@/user/stores/booking.js';
    const bookingStore = useBookingStore();
    const router = useRouter();
    const props = defineProps(['rooms']);
    const emits = defineEmits(['reserve']);
    const roomSelectedNumber = ref({});
    const totalPrice = computed(() => {
      let total = 0;
      for (const room of props.rooms){
        total += roomSelectedNumber.value[room.roomId] * room.partPrice;
      }
      return total;
    })
    for (const room of props.rooms) {
        roomSelectedNumber.value[room.roomId] = 0;
    }
    function handleReserve(){
      bookingStore.setSelectedRoomNumber(roomSelectedNumber.value)
      router.push({
        path:"/user/booking",
        query: {
          hotelId: props.rooms[0].hotelId,
          rooms:JSON.stringify(roomSelectedNumber.value)
        }
      })

    }
</script>
    
<style scoped>
    /* --- 房型預訂區 --- */
.room-booking-section h3 {
margin-top: 15px;
  padding-top: 15px;
  margin-bottom: 20px;
  border-top: 1px solid rgba(128, 128, 128, 0.374);
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 15px;
  border: 1px solid rgba(164, 158, 158, 0.534);
  border-radius: 8px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.room-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.205);
}

.room-details h3 {
  margin-top: 0;
  margin-bottom: 8px;
  
}

.room-details p {
  margin: 4px 0;
  font-size: 0.95em;
  color: #555;
}

.room-price-action {
  text-align: right;
  min-width: 180px;
}

.price-box {
  margin-bottom: 5px;
}

.currency {
  font-size: 0.9em;
  font-weight: 500;
  color: #666;
}

.price {
  font-size: 1.5em;
  font-weight: bold;
  color: #d9534f; /* 價格使用紅色突出 */
  margin: 0 5px;
}

.unit {
  font-size: 0.9em;
  color: #666;
}

.stock-info {
  margin: 0 0 10px 0;
  font-size: 0.9em;
}

.in-stock {
  color: red;
  font-weight: bold;
}

.out-stock {
  color: #d9534f;
  font-weight: bold;
}

.selected-number {
    width: 50px;
}
.booking-btn {
    background-color: rgb(152, 236, 152);
    float: right
}

.booking-btn:hover {
    background-color: hsl(120, 69%, 50%);
}
.total-price{
  font-size:large;
  font-weight: 600;
  text-align: right;
}
</style>