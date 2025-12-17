<template>
 
     <div class="map-with-panel">  
    <!-- 🔹 左側的飯店 Summary Panel -->
            <div class="hotel-panel">
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
                <input class="inputGuest" v-model="guestNumber" @click.stop/>
                <button @click.stop="incrementGuest">+</button>
            </div>
            </div>
        </div>
        <button class="search-btn" @click="fetchHotel">搜尋</button>
        </div>
      <h3>附近飯店</h3>

      <div v-if="hotels.length === 0">
        <p>尚無資料，請在地圖上點擊。</p>
      </div>

<ul v-else class="hotel-list">
  <li
    v-for="hotel in hotels"
    :key="hotel.id"
    :id="`hotel-${hotel.id}`"
    class="hotel-item"
    @click="goToHotelInfo(hotel)"
    :class="{ 'selected': selectedHotelId === hotel.id }"
  >
    <div class="hotel-photo-wrapper">
      <img :src="`${path}?photoUrl=${hotel.coverPhotoUrl}`" class="hotel-photo" />
    </div>
<div class="hotel-info">
        
        <h4>{{ hotel.name }}</h4>

<div style="display: flex; align-items: center; margin-bottom: 6px;">
        
        <div class="hotel-stars" style="color: #ffc107; font-size: 1rem; margin-right: 15px;">
            <span v-for="n in hotel.starRating" :key="'s'+n">★</span> 
            <span style="font-size: 0.85rem; color: #6c757d; margin-left: 5px;">({{ hotel.starRating }} 星級)</span>
        </div>
        
        <div style="width: 1px; height: 18px; background: #ced4da; margin-right: 15px;"></div>

        <div class="user-rating-label">
            <span style="font-weight: bold;">評分:{{ hotel.averageRating.toFixed(1) }} / 5.0</span>
        </div>
    </div>
        
        <p>
            <span style="font-weight: 600;">地點：</span>
            {{ hotel.cityName }} {{ hotel.districtName }}
        </p>

        <p>
            <span style="font-weight: 600;">房型：</span>
            {{ hotel.roomName }} / {{ hotel.bedType }}x{{hotel.bedNumber}}
        </p>
        
        <p style="font-size: 0.85rem; color: #6c757d;">
            距離：{{ hotel.distanceKm.toFixed(2) }} km <br>
        </p>
        
    </div>
<!-- 價格放右下角 -->
<div class="price-tag">
  NT$ {{ hotel.minPriceForNight.toLocaleString() }}/{{ hotelStore.night }}晚
</div>
  </li>
</ul>
    </div>

    <!-- 🔹 右側 Google Map -->
    <div class="map-container">
      <div id="map-canvas" class="map-canvas"></div>
    </div>

  </div>
</template>


<script setup>
import myAxios from '@/user/plugin/axios';
import { ref, onMounted } from 'vue';
import {shallowRef, toRaw} from 'vue'
const path = import.meta.env.VITE_PHOTO_URL;

const mapInstance = shallowRef(null);
const markerInstance = shallowRef(null);
const selectedCoords = ref({ lat: null, lng: null });
const hotels = ref([]);
const hotelMarkers = ref([]);
const selectedHotelId = ref(null);
const infoWindow = shallowRef(null);
// 預設中心點 (台北)
const DEFAULT_CENTER = { lat: 25.0478, lng: 121.5319 };

// 地圖初始化邏輯
async function initializeMap() {
    // 載入api函示庫
    const { Map } = await google.maps.importLibrary("maps");

    // 創建地圖實例
    mapInstance.value = new Map(document.getElementById("map-canvas"), {
        mapId: 'MAP_ID',
        center: DEFAULT_CENTER,
        zoom: 15,
    });
    selectedCoords.value = DEFAULT_CENTER;
    updateMarker(selectedCoords.value);
    fetchHotel();

    // 監聽點擊事件
    mapInstance.value.addListener("click", (mapsMouseEvent) => {
        const coords = mapsMouseEvent.latLng.toJSON();
        
        selectedCoords.value = coords;

        // 更新標記
        updateMarker(mapsMouseEvent.latLng);
        

    });
}

// 處理標記更新的函數
async function updateMarker(location) {

    const { AdvancedMarkerElement, PinElement  } = await google.maps.importLibrary("marker");
    if (markerInstance.value) {
        markerInstance.value.map = null;
    }
    markerInstance.value = new AdvancedMarkerElement({
        position: location,
        map: toRaw(mapInstance.value),
        title: "選取的起點",
    });
    fetchHotel();
}
//建立飯店標記
async function setMarker(){
    const { AdvancedMarkerElement, PinElement  } = await google.maps.importLibrary("marker");
    clearHotelMarkers();
    console.log('設置標記，飯店數量：', hotels.value.length);
    for (let hotel of hotels.value){
        const marker = new AdvancedMarkerElement({
            map: toRaw(mapInstance.value),
            position: {lat: hotel.latitude, lng: hotel.longitude},
            title: hotel.name,
            content: new PinElement({
            background: "#008000", // Pin 顏色
            borderColor: "#008000",
            glyph:'🏠'
        }),
        });
        marker.hotelId = hotel.id;
        marker.addListener("click", () => {
          if (infoWindow.value){
            infoWindow.value.close();
          }
          const hotelElement = document.getElementById(`hotel-${hotel.id}`);
          if (hotelElement) {
            hotelElement.scrollIntoView({
              behavior: 'smooth',
              block:'center'
            })
          }
          selectedHotelId.value=hotel.id
          mapInstance.value.panTo(marker.position);

          //infoWindow
          infoWindow.value = new google.maps.InfoWindow({
            content: createInfoWindowContent(hotel)
          });
          infoWindow.value.open({
            anchor: marker,
            map:toRaw(mapInstance.value)
          });
          
        });
        hotelMarkers.value.push(marker);
    }
    console.log('已建立標記數量：', hotelMarkers.value.length);
}
//事件委派 監聽view-detail-btn
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-detail-btn")) {
        const hotelId = e.target.dataset.hotelId;
        router.push(`/user/hotelInfo/${hotelId}`);
    }
});

//移動地圖到那個飯店
function panToHotel(hotel) {
    if (!mapInstance.value || !hotel) return;

    // 1. 設定選中狀態 (用於列表高亮)
    selectedHotelId.value = hotel.id; 

    // 2. 移動地圖
    mapInstance.value.panTo({ lat: hotel.latitude, lng: hotel.longitude });

    // 3. 關閉舊的 InfoWindow
    if (infoWindow.value){
        infoWindow.value.close();
    }
    
    // 4. 找到對應的 Marker 並開啟 InfoWindow
    const targetMarker = hotelMarkers.value.find(m => m.hotelId === hotel.id);

    if (targetMarker) {
        infoWindow.value = new google.maps.InfoWindow({
            content: createInfoWindowContent(hotel)
        });
        
        infoWindow.value.open({
            anchor: targetMarker,
            map: toRaw(mapInstance.value)
        });
    }
}

// InfoWindow 內容生成函式
function createInfoWindowContent(hotel) {
    return `
        <div style="padding: 5px 10px; font-family: Arial, sans-serif; max-width: 250px;">
            <h5 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #343a40;">
                ${hotel.name}
            </h5>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <span style="color: #0f4d46; font-size: 1rem;">
                    ${'★'.repeat(hotel.starRating)} 
                </span>
                
                <span style="
                    color: white; 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    font-size: 0.8rem;
                    font-weight: bold;
                ">
                    ${hotel.averageRating.toFixed(1)} ${hotel.averageRating}
                </span>
            </div>
            
            <p style="margin: 3px 0; font-size: 0.9rem; color: #6c757d;">
                <span style="font-weight: 600;">距離:</span> ${hotel.distanceKm.toFixed(2)} km
            </p>

            <p style="margin: 0; font-size: 1rem; color: #e74c3c; font-weight: 700;">
                <span style="font-size: 0.8rem; color: #6c757d;">最低價:</span> 
                NT$ ${hotel.minPriceForNight.toLocaleString()}
            </p>

            <button
            data-hotel-id="${hotel.id}" class="view-detail-btn" 
            onclick="console.log('Navigating to hotel ${hotel.id}');" 
                    style="
                        background-color: #0f4d46; 
                        color: white; 
                        border: none; 
                        padding: 6px 10px; 
                        border-radius: 4px; 
                        margin-top: 10px; 
                        width: 100%;
                        cursor: pointer;
                        font-size: 0.9rem;
                    ">
                查看詳情
            </button>
        </div>
    `;
}

// 清除所有飯店標記
function clearHotelMarkers() {
    
    hotelMarkers.value.forEach(marker => {
        marker.map = null;
    });
    hotelMarkers.value = [];
}

function fetchHotel() {
    // searchData.keyword = cityName;
    searchData.checkInDate = checkInDate.value;
    searchData.checkOutDate = checkOutDate.value;
    searchData.guestNumber = guestNumber.value;
    myAxios({
        method:'get',
        url:'/api/hotels/map',
        params:{
            latitude: selectedCoords.value.lat,
            longitude: selectedCoords.value.lng,
            checkInDate: checkInDate.value,
            checkOutDate: checkOutDate.value,
            guestNumber: guestNumber.value
        }
    })
    .then( response=>{
         console.log('完整回應：', response);
        console.log('回應類型：', typeof response);
        console.log('response.data：', response.data);
        console.log('data 類型：', typeof response.data);
        hotels.value = response.data;
        setMarker();
    })
    .catch(error=>{
        console.log(error);
    })
}

//searchbar
import useHotelStore from "@/user/stores/hotel.js" ;
import { useRouter } from 'vue-router';
const router = useRouter();
const hotelStore = useHotelStore();
const searchData = hotelStore.searchData;
const showGuestBox = ref(false);
const checkInDate = ref(hotelStore.searchData.checkInDate);
const checkOutDate = ref(hotelStore.searchData.checkOutDate);
console.log("checkInDate" + checkInDate.value);
const guestNumber = ref(hotelStore.searchData.guestNumber);

function goToHotelInfo(hotel){
   // 1. 執行地圖移動和高亮
    panToHotel(hotel); 

    // 2. (可選) 讓列表項目滾動到視圖中央
    const hotelElement = document.getElementById(`hotel-${hotel.id}`);
    if (hotelElement) {
        hotelElement.scrollIntoView({
            behavior: 'smooth',
            block:'center'
        })
    }
    searchData.keyword = hotel.cityName;
    searchData.checkInDate = checkInDate.value;
    searchData.checkOutDate = checkOutDate.value;
    searchData.guestNumber = guestNumber.value;
    // router.push(`/user/hotelInfo/${hotel.id}`);
}

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




onMounted(() => {
    // 確保組件載入後，如果 API 已經完成載入，就初始化地圖
    if (window.google && window.google.maps) {
        initializeMap();
    } else {
        // 如果 API 尚未載入，將初始化函式掛載到全局 window.initMap，等待 API 載入時呼叫
        window.initMap = initializeMap;
    }
});
</script>

<style scoped>
.map-with-panel {
  display: flex;
  width: 100%;
  max-height: 100vh;
}

.hotel-panel {
  width: 550px;
  padding: 15px;
  background: hsla(210, 20%, 98%, 0.977);
  border-right: 1px solid #e9ecef;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  max-height: 100vh;
}

.hotel-panel h3 {
    margin-top: 20px;
    margin-bottom: 15px;
    color: #343a40;
    font-size: 1.5rem;
    border-bottom: 2px solid #139898; /* 主題色底線 */
    padding-bottom: 5px;
}
/* 📃 飯店列表 */
.hotel-list {
    list-style: none;
    padding: 0;
    margin-top: 15px;
}

.hotel-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    border: 1px solid #e9ecef; /* 輕微邊框 */
    border-radius: 8px;
    margin-bottom: 15px;
    align-items: flex-start;
    position: relative; 
    cursor: pointer;
    transition: box-shadow 0.2s, background-color 0.2s;
    background: white;
}

.hotel-item:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 懸停陰影 */
}
.hotel-info {
  position: relative;
  display: flex;
  flex-direction: column;
}

.hotel-info p {
    margin: 2px 0;
    line-height: 1.4;
    font-size: 0.9rem;
    color: #323536;
}

.hotel-info h4 {
    margin: 0 0 5px 0;
    font-size: 1.15rem;
    color: #343a40;
    font-weight: 600;
}

.hotel-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hotel-photo-wrapper {
  position: relative;
  width: 200px;      /* 調整圖片寬度 */
  height: 150px;     /* 調整圖片高度 */
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.price-tag {
    position: absolute;
    bottom: 15px;
    right: 15px;
    color: #e74c3c; /* 醒目紅色 */
    font-size: 1.1rem;
    font-weight: 700;
    /* 取消 padding/border，直接作為文字強調 */
}
.map-container {
  flex: 1;
  position: relative;
}

.map-canvas {
  height: 100vh;
  width: 100%;
}

.user-rating-label {
    /* 這裡使用一個小方形來突出分數，與星級區隔 */
    padding: 2px 5px; 
    border-radius: 4px;
    color: rgb(118, 125, 22); 
    font-size: 0.9rem;
    line-height: 1;
}

/* 確保星級的金色樣式，避免混淆 */
.hotel-stars {
    display: flex;
    align-items: center;
}
/* 搜尋欄位 */
.hotel-search-panel {
    display: flex;
    gap: 10px;
    padding: 15px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.473);
    align-items: flex-end;
    margin-bottom: 20px;
}

.search-field {
    display: flex;
    flex-direction: column;
    flex: 1; /* 讓欄位平均分佈 */
    min-width: 0; /* 確保在 flex 容器中能正確縮小 */
}

.search-field label {
    font-size: 0.8rem;
    margin-bottom: 6px;
    color: #6c757d;
    font-weight: 600;
}

.search-field input[type="date"],
.guest-box {
    padding: 8px 10px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    color: #495057;
    transition: border-color 0.2s;
    background-color: #fff;
    cursor: pointer;
}
.search-field input:focus,
.guest-box:hover {
    border-color: #139898; 
    outline: none;
}

/* 旅客數量選擇器 */
.guest-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.guest-popup {
    position: absolute;
    top: 100%; /* 確保在 guest-box 下方 */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    border: 1px solid #ced4da;
    border-radius: 8px;
    padding: 10px 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
    margin-top: 5px;
}

.inputGuest {
    width: 40px !important; /* 覆蓋 input 樣式 */
    text-align: center;
    padding: 5px !important;
    margin: 0 !important;
    border: 1px solid #ced4da !important;
    border-radius: 4px !important;
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
    background: #0b6d6d;
}
.hotel-item.selected {
  background-color: #e0f7f7; 
  border-left: 3px solid #139898;
}

.search-btn {
  padding: 8px 18px;
  background: #139898;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  height: 40px; /* 與輸入框高度一致 */
}
.search-btn:hover {
    background: #095f5f;
}
</style>