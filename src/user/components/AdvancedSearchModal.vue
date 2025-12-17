<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <h3>進階搜尋</h3>
      <div class="filter-group">

      
        <div class="filter-item">
          <div class="price-display-wrapper">
            <label class="filter-label">價格區間 (每晚): 
            <span class="price-value">{{ minPrice}}－{{ maxPrice}}</span>
            </label>
          </div>
          <!-- 雙滑桿容器 -->
          <div class="range-slider">
            <div class="slider-track"></div>
            <div 
              class="slider-range" 
              :style="rangeStyle"
            ></div>
            <input
              type="range"
              v-model.number="minPrice"
              :min="min"
              :max="max"
              :step="step"
              class="slider"
              @input="adjustPrice"
            />
            <input
              type="range"
              v-model.number="maxPrice"
              :min="min"
              :max="max"
              :step="step"
              class="slider"
              @input="adjustPrice"
            />
          </div>
        </div>
      </div>
       <div class="filter-item">
          <label class="filter-label">飯店類型</label>
          <div class="checkbox-group">
              <template v-for=" hotelType in hotelTypes" :key="hotelType.id" >
                  <label class="checkbox-label">
                      <input
                          :id="'type-' + hotelType.id" 
                          type="checkbox" 
                          :value="hotelType.id" 
                          v-model="selectedTypes"
                          class="hidden-checkbox"
                      > 
                      {{ hotelType.type}}
                  </label>
              </template>
          </div>
      </div>

      <div class="filter-item star-item">
          <label class="filter-label">星級</label>
          <div class="star-select-wrapper">
            <select v-model="selectedStar" class="star-select">
              <option :value="0">不限</option>
              <option :value="1">⭐ 1 星</option>
              <option :value="2">⭐⭐ 2 星</option>
              <option :value="3">⭐⭐⭐ 3 星</option>
              <option :value="4">⭐⭐⭐⭐ 4 星</option>
              <option :value="5">⭐⭐⭐⭐⭐ 5 星</option>
            </select>
          </div>
        </div>

      <div class="filter-item">
          <div class="facility-header">
            <label class="filter-label">飯店設施</label>
            <button type="button" class="toggle-btn" 
              @click="toggleFacilities">{{ showAllFacilities ? '隱藏部分' : `顯示所有 (${facilities.length} 項)` }}</button>
          </div>
          <div class="checkbox-group facility-group">
            <template v-for="facility in displayedFacilities" :key="facility.id">
              <label :for="'facility-' + facility.id" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :id="'facility-' + facility.id" 
                  :value="facility.id" 
                  v-model="selectedFacilities"
                  class="hidden-checkbox"
                >
                {{ facility.name }}
              </label>
            </template>
          </div>
        </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="apply-btn" @click="apply">套用</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed} from 'vue'
import myAxios from '@/user/plugin/axios.js'
const hotelTypes = ref([]);
const facilities = ref([]);
let displayedFacilities = ref({});

  myAxios({
    method: 'get',
    url: '/api/hotel-types',
  })
    .then(response => {
      console.log(response);
      hotelTypes.value = response.data;
    })
    .catch(error => console.log(error));  


  myAxios({
    method: 'get',
    url: '/api/facilities',
  })
    .then(response => {
      console.log(response);
      facilities.value = response.data;
      displayedFacilities = ref(facilities.value.slice(0, displayCount.value));
    })
    .catch(error => console.log(error));  
  
  const props = defineProps(["filterData"]);
  const emit = defineEmits(["close", "apply"])
  
  const min = 0;
  const max = 20000;
  const step = 100;
  const minPrice = ref(props.filterData?.minPrice ?? min)
  const maxPrice = ref(props.filterData?.maxPrice ?? max)
  const selectedStar = ref(props.filterData?.star ?? 0)
  const selectedTypes = ref(props.filterData?.hotelTypes ?? [])
  const selectedFacilities = ref(props.filterData?.facilities ?? [])

// 套用後 emit
function apply() {
  const newFilterData = {
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    star: selectedStar.value,
    hotelTypes: selectedTypes.value,
    facilities: selectedFacilities.value
  };
  emit("apply", newFilterData); 
}

// 關閉 modal
function close() {
  emit("close")
}

function adjustPrice() {
  if (minPrice.value > maxPrice.value) {
    maxPrice.value = minPrice.value
  }
  if (maxPrice.value < minPrice.value) {
    minPrice.value = maxPrice.value
  }
}
const rangeStyle = computed(() => {
  const leftPercent = ((minPrice.value - min) / (max - min)) * 100;
  const rightPercent = ((maxPrice.value - min) / (max - min)) * 100;

  return {
  left: `${leftPercent}%`,
  width: `${rightPercent - leftPercent}%`
};
})
let displayCount = ref(5);
let showAllFacilities =ref(false);
function toggleFacilities() {
  showAllFacilities.value = !showAllFacilities.value;
  displayCount.value = showAllFacilities.value ? facilities.value.length : 5;
  displayedFacilities.value = facilities.value.slice(0, displayCount.value);
}

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}
h3 {
  font-size: 1.5rem;
  color: #0f4d46;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee; /* 增加分隔線 */
  padding-bottom: 10px;
}
.filter-item {
  margin-bottom: 16px;
  padding: 15px 0 ;
  border-bottom: 1px solid #f0f0f0;
}
/* .filter-item:last-child {
  border-bottom: none;
} */


.filter-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 15px 0; 
}

/* 價格 */
.price-display-wrapper {
  display: flex;
  align-items: center;
}
.price-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.cancel-btn {
  background: #ccc;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.apply-btn {
  background: #139898;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.hotel-type-container {
  margin-bottom: 15px;
}
.hotel-type {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}


/* 雙滑桿樣式 */
.range-slider {
  position: relative;
  height: 30px;
  /* margin: 15px 0px 10px 0; */
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  top: 50%;
  transform: translateY(-50%);
}

.slider-range {
  position: absolute;
  height: 6px;
  background: #139898;
  border-radius: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.slider {
  position: absolute;
  width: 100%;
  height: 6px;
  background: transparent;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #139898;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #139898;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-webkit-slider-thumb:hover {
  background: #0f7878;
}

.slider::-moz-range-thumb:hover {
  background: #0f7878;
}

.toggle-btn {
  background: transparent;
  border: 1px solid #139898;
  color: #139898;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}
.star-item {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    gap: 10px;
}
.star-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 120px;
  cursor: pointer;
}
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 6px;
}

/* 隱藏原生 Checkbox */
.hidden-checkbox {
    position: absolute;  /*讓checkbox存在但不占空間*/ 
    opacity: 0;
    width: 0;
    height: 0;
}
.checkbox-label {
    display: inline-flex;
    align-items: center;
    padding: 8px 15px;
    border: 1px solid #ccc;
    border-radius: 20px; /* 圓角標籤 */
    cursor: pointer;
    font-size: 0.95rem;
    color: #495057;
    transition: all 0.2s;
}

.checkbox-label:has(.hidden-checkbox:checked) {
    background-color: #e6f7f7; /* 淺綠色背景 */
    border-color: #139898;
    color: #0f4d46;
    font-weight: 500;
}

/* --- 設施切換按鈕 --- */
.facility-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.toggle-btn {
  background: transparent;
  border: none; /* 移除邊框 */
  color: #139898;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}
.toggle-btn:hover {
  color: #0a7070;
  text-decoration: underline;
}
/* --- 底部按鈕 --- */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  margin-top: 15px;
}

.cancel-btn {
  background: #f0f0f0; /* 淺灰色背景 */
  color: #495057;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.cancel-btn:hover {
    background: #e0e0e0;
}

.apply-btn {
  background: #139898;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.apply-btn:hover {
  background: #0a7070;
}
</style>
