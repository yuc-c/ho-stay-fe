<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <h3>進階搜尋</h3>

      <div class="filter-item">
        <label>價格區間</label>
        <div class="price-range">
          <input type="number" v-model="localMin" placeholder="最低價">
          <span>—</span>
          <input type="number" v-model="localMax" placeholder="最高價">
        </div>
      </div>

      <div class="filter-item">
        <label>飯店類型</label>
        <div class="hotel-type-list">
          <label v-for="type in hotelTypes" :key="type.id" class="hotel-type-item">
            <input type="checkbox" :value="type.id">
            <span>{{ type.type }}</span>
          </label>
        </div>
      </div>

      <div class="filter-item">
        <label>星級</label>
        <select v-model="localStar">
          <option value="">不限</option>
          <option value="1">⭐</option>
          <option value="2">⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
        </select>
      </div>

      <div class="modal-btns">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="apply-btn" @click="apply">套用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { get } from '@/administrant/api/request'

const props = defineProps({
  min: Number,
  max: Number,
  star: String
})

const emit = defineEmits(['close', 'apply'])

const hotelTypes = ref([])
const localMin = ref(props.min || '')
const localMax = ref(props.max || '')
const localStar = ref(props.star || '')

const fetchHotelTypes = async () => {
  try {
    const data = await get('/api/hotel-types')
    hotelTypes.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    console.error('fetchHotelTypes error:', error)
  }
}

onMounted(fetchHotelTypes)

const apply = () => {
  emit('apply', {
    min: localMin.value,
    max: localMax.value,
    star: localStar.value
  })
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
}

.modal-container {
  width: min(550px, 92vw);
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.filter-item {
  margin-bottom: 18px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.hotel-type-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.hotel-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.modal-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.apply-btn {
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}

.apply-btn {
  background: #139898;
  color: #fff;
}
</style>

