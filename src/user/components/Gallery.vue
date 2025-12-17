<template>
    <div class="photo-gallery">
    <!-- 主圖片 -->
    <div class="arrow left" @click="prevPhoto">&#10094;</div>
    <img :src="`${path}?photoUrl=${photos[currentIndex]}`" class="main-photo">
    <div class="arrow right" @click="nextPhoto">&#10095;</div>

    <div class="thumbnail-row">
        <template v-for="(photo, index) in photos.slice(thumbnailPhotoMin, thumbnailPhotoMax + 1)" :key="index" >
            <img :src="`${path}?photoUrl=${photo}`"  class="thumbnail-photo" 
            :class="{ active: index + thumbnailPhotoMin === currentIndex }"
            @click="currentIndex = index + thumbnailPhotoMin">
        </template>
    </div>

</div>


</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
const props = defineProps(['photos']);
const path = import.meta.env.VITE_PHOTO_URL;
let currentIndex = ref(0);
let thumbnailPhotoMin = ref(0);
let thumbnailPhotoMax = props.photos.length <= 7 ? ref(props.photos.length) : ref(6);

function prevPhoto() {
    currentIndex.value--;
    if (currentIndex.value < 0) {
        currentIndex.value = props.photos.length - 1;
    }
    updateThumbnailRange();
    console.log(currentIndex.value);
    console.log("tmsx" + thumbnailPhotoMax.value);
    console.log("tmin" + thumbnailPhotoMin.value);
}

function nextPhoto() {
    currentIndex.value++;
    if (currentIndex.value >= props.photos.length) {
        currentIndex.value = 0;
    }
    updateThumbnailRange();
    console.log(currentIndex.value);
    console.log("tmsx" + thumbnailPhotoMax.value);
    console.log("tmin" + thumbnailPhotoMin.value);
}
function updateThumbnailRange() {
    const maxVisible = 7; // 一次顯示 6 張

    // 如果照片數量 <= 6，全部顯示
    if (props.photos.length <= maxVisible) {
        thumbnailPhotoMin.value = 0;
        thumbnailPhotoMax.value = props.photos.length - 1;
        return;
    }

    if (currentIndex.value < thumbnailPhotoMin.value) {
        thumbnailPhotoMin.value = currentIndex.value;
        thumbnailPhotoMax.value = currentIndex.value + maxVisible - 1;
    }
    
    else if (currentIndex.value > thumbnailPhotoMax.value) {
        thumbnailPhotoMax.value = currentIndex.value;
        thumbnailPhotoMin.value = currentIndex.value - maxVisible + 1;
    }
}
</script>

<style scoped>
.photo-gallery {
  position: relative;
  overflow: hidden;
  width:50%;
  max-width: 572px;
  min-width:500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  aspect-ratio: 4 / 4;
}
.main-photo {
  width: 100%;
  height: 85%;
  flex-grow: 1;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32px;
  color: white;
  background: rgba(0,0,0,0.3);
  background-size: 10px;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
  z-index: 10;
}
.arrow.left {
  left: 10px;
}
.arrow.right {
  right: 10px;
}
.arrow:hover {
  background: rgba(0,0,0,0.6);
}
/* 縮略圖橫向排列 */
.thumbnail-row {
  flex-shrink: 0;
  display: flex;
  gap: 2px;
  overflow-x: auto;
white-space: nowrap;
scrollbar-width: none;
  overflow-y: hidden;
  height: 100px; 
}
.thumbnail-row::-webkit-scrollbar {
  display: none; /* 隱藏捲動條（Chrome/Safari） */
}
.thumbnail-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;
}

.thumbnail-photo:hover {
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail-photo.active {
  opacity: 1;
  border: 2px solid #075a31; /* 或你喜歡的顏色 */
  transform: scale(1.05);
}
</style>