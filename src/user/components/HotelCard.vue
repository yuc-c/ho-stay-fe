<template>
        <!-- 飯店卡片 -->
        <div class="hotel-card" @click="emits('hotelSelected', hotel.hotelId)" >
          <div class="hotel-img" :style="{ backgroundImage: `url('${path}?photoUrl=${hotel.photoUrl}')` }">
              <button class="favorite-btn" @click.stop="toggleFavorite(hotel.hotelId)">
                <span v-if="isFavorite">❤️</span>
                <span v-else>🤍</span>
              </button>
          </div>
          <div class="hotel-details">
            <div class="hotel-info">
              <h3 class="hotel-name">{{ hotel.hotelName }}
                <span class="star-rating">{{'★'.repeat(hotel.starRating) }}
                </span>
              </h3>

              <div class="rating-section" v-if="hotel.avgRating != 0">
                    <span class="thumbs-up-stars">
                     <span 
                         v-for="n in 5" 
                         :key="n" 
                         class="thumbs-up-icon-wrapper"
                     >
                         <ThumpUpIcon 
                             :color="n <= hotel.avgRating ? '#0f4d46' : '#cccccc'"
                             class="thump-up-icon"
                         ></ThumpUpIcon>
                     </span>
                 </span>
                    
                    <span class="avg-rating">{{ hotel.avgRating.toFixed(1) }} / 5.0</span>
              </div>

              <div class="location-text">
                {{ hotel.city }} {{ hotel.district }}
              </div>

              <div class="room-details">
                <span class="room-type">{{ hotel.roomType }}</span>
                <span class="bed-info">{{ hotel.bedType }} * {{hotel.bedNumber}}
                </span>
              </div>

              <div>最多入住{{ hotel.maxOccupancy }}人</div>

            </div>
            <div class="price-section">
              <div class="price">{{ hotel.night }}晚 NT$ {{ hotel.partPrice.toLocaleString() }}</div>
            </div>

          </div>
        </div>
</template>
    
<script setup>
    import ThumpUpIcon from '@/user/components/icons/ThumpUpIcon.vue' 
    const props = defineProps(['hotel', "isFavorite"])
    const emits = defineEmits(['hotelSelected', 'toggleFavorite'])
    const path = import.meta.env.VITE_PHOTO_URL;

    function toggleFavorite(hotelId) {
      console.log("hotelCard isfavorite" + props.isFavorite)
      emits("toggleFavorite", hotelId, props.isFavorite);
    }

</script>
    
<style scoped>
.hotel-card {
  position: relative;
  display: flex;
  gap: 16px;
  border: 1px solid rgb(212, 211, 211);
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  transition: 0.2s;
  cursor: pointer;
}

.hotel-card:hover {
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
}

.hotel-img {
  position:relative;
  width: 200px;
  height: 180px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.price {
  position: absolute;
  margin-top: 8px;
  font-size: 18px;
  font-weight: bold;
  color: red;
  right:15px;
  bottom: 15px;
}

.favorite-btn {
  border: none;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  cursor: pointer;
  background: transparent;
  font-size: 1.2em;
}
.favorite-btn:hover {
   transform: scale(1.2);
}

.hotel-info > div {
    margin-top: 5px;
    font-size: 0.95rem;
}

.hotel-name {
    font-size: 1.35rem;
    color: #0f4d46; /* 使用深色主題色 */
    margin: 0 0 8px 0;
    font-weight: 700;
    line-height: 1.4;
}

.hotel-name .star-rating{
  color: #ffc107;
}

/* --- 評分區 --- */
.rating-section {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}
.rating-stars .star {
    color: #ccc;
    margin-right: 1px;
    font-size: 1rem;
}
.rating-stars .filled {
    color: #ffc107; /* 金色 */
}
.avg-rating {
    font-weight: 600;
    font-size: 1rem;
    color: #139898;
    margin-left: 8px;
}
.location-text {
    font-weight: 500;
    color: #343a40 !important;
}

/* --- 價格區 (price-section) --- */
.price-section {
    text-align: right;
    padding-top: 10px;
}
.price-label {
    font-size: 0.85rem;
    color: #6c757d;
}
.price-value {
    font-size: 1.7rem;
    font-weight: 800;
    color: #e63b47; /* 醒目的紅色 */
    line-height: 1.2;
}

.thump-up-icon {
  width: 20px;
  height: 20px;
  margin: 0 2px;
}

.room-details {
  display: flex;
  gap: 10px;
}
</style>