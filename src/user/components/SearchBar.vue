<template>
         <section class="booking-search">
    
    
    <div class="search-bar">
      <div class="search-field">
        <label>目的地</label>
        <input type="text" placeholder="輸入城市或飯店名稱" :value="searchData.keyword"  @input="updateField('keyword', $event.target.value)">
        <p class="error-message" v-if="searchData.keyword.length == 0">{{ keywordMessage }}</p>
      </div>
      
      <div class="search-field">
        <label>入住日期</label>
        <input type="date" :value="searchData.checkInDate" @input="updateField('checkInDate', $event.target.value)">
        <p class="error-message" v-if="searchData.checkInDate.length == 0">{{ checkInDateMessage }}</p>
      </div>
      
      <div class="search-field">
        <label>退房日期</label>
        <input type="date" :value="searchData.checkOutDate" @input="updateField('checkOutDate', $event.target.value)">
        <p class="error-message" v-if="searchData?.checkOutDate.length == 0">{{ checkOutDateMessage }}</p>
      </div>
      <div class="search-field">
        <label>人數</label>
        <div class="guest-box" @click="toggleGuestBox">
          {{ searchData.guestNumber }} 位旅客
          <div v-if="showGuestBox" class="guest-popup">
            <button type="button" @click.stop="decrementGuest">-</button>
            <input type="text" class="inputGuest"  @click.stop :value="searchData.guestNumber">
            <button type="button" @click.stop="incrementGuest">+</button>
          </div>
        </div>
      </div>

        <button class="search-btn" @click="searchHotel">搜尋</button>
   
        <!-- 進階搜尋小圖示 -->
        <img 
        src="@/user/assets/advanced.png" 
        class="advanced-icon"
        @click="openAdvanced"
        />
        <MapIcon class="action-icon" @click="goToMap"></MapIcon>


    </div>
  </section>

</template>
    
<script setup>
    import MapIcon from '@/user/components/icons/MapIcon.vue';
    import {ref} from 'vue';
    import useHotelStore from '@/user/stores/hotel.js'
    const hotelStore = useHotelStore();

    const showGuestBox = ref(false)
    const props = defineProps(['searchData','keywordMessage','checkInDateMessage','checkOutDateMessage','guestsMessage'])
    const emits = defineEmits(['update:searchData', 'searchHotel', 'openAdvanced', 'goToMap' ])

    function goToMap(){
      emits('goToMap');
    }

    function updateField(key, value){
        emits('update:searchData', {
                ...props.searchData,
                [key]: value
                });
    }

    function searchHotel(){
        emits('searchHotel');
    }

    function toggleGuestBox() {
    showGuestBox.value = !showGuestBox.value
    }

    function incrementGuest() {
    console.log("按鈕增加=" + props.searchData.guestNumber + 1);
    emits('update:searchData', {
        ...props.searchData,
        guestNumber: props.searchData.guestNumber + 1
    });
    }

    function decrementGuest() {
    if (props.searchData.guestNumber > 1) {
        emits('update:searchData', {
        ...props.searchData,
        guestNumber: props.searchData.guestNumber - 1
        });
    }
    }
   
    //進階搜尋按鈕
    function openAdvanced() {
        emits('openAdvanced');
    }

</script>
    
<style scoped>
    /* 搜尋列 */
.booking-search {
  padding: 60px 0 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-bar {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  position: relative;
}

.search-field label {
  font-size: 0.9rem;
  color: #0f4d46;
  font-weight: 600;
  margin-bottom: 4px;
}

.search-field input,
.search-field select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  outline: none;
  color: #495057;
  transition: border-color 0.2s;
}

.search-field input:focus,
.guest-box:hover {
  border-color: #139898; 
  outline: none;
}

.search-btn {
  background-color: #139898;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  cursor: pointer;
}

.search-btn:hover {
  background: #095f5f;
}

.guest-box {
  position: relative;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  background-color: #fff;
  display: flex; /* 確保內容居中 */
  align-items: center;
}

.guest-popup {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-top: 5px;
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

.guest-popup button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #139898;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: normal;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guest-popup button:hover {
  background: #0a7070;
}

.guest-popup span {
  min-width: 20px;
  text-align: center;
  font-weight: 500;
}
.inputGuest {
  width: 40px !important; 
  text-align: center;
  padding: 5px !important;
  margin: 0 !important;
  border: 1px solid #ced4da !important;
  border-radius: 4px !important;
}
.advanced-btn {
  background-color: transparent;
  color: #139898;
  border: 1px solid #139898;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.advanced-btn:hover {
  background-color: #139898;
  color: white;
}

.advanced-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  margin-bottom: 4px;
  margin-left: auto;
  transition: 0.2s;
}

.advanced-icon:hover {
  transform: scale(1.1);
}

/* 錯誤訊息 */
.error-message {
  color: red;
  position: absolute;
  top: 100%;
  left: 25%;
  font-size: 0.8rem;
}


.action-icon {
    width: 32px;
    height: 32px;
    cursor: pointer;
    margin-bottom: 4px;
    transition: transform 0.2s;
    color: #139898;
}

.filter-icon {
    margin-left: 10px; 
    stroke: #139898
}

.map-icon {
    margin-left: 10px; 
}

.action-icon:hover {
    transform: scale(1.1);
}
</style>