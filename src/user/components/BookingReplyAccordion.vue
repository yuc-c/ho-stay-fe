<template>
  <Accordion value="null" expandIcon="pi pi-plus" collapseIcon="pi pi-minus">
    <AccordionPanel v-for="(item, index) in reviews" :key="item.reviewId" :value="index">
      <AccordionHeader>
        <span class="flex items-center gap-2 w-full">
          <img :src="`${photoPath}?photoUrl=${item?.image}`" class="rounded-circle me-2 border border-2 border-light" width="40" height="40" />
          <span class="font-bold whitespace-nowrap">{{ item.user?.lastName || '' }}{{ item.user?.firstName || '' }}</span>
          <Badge v-if="!item.reply" value="尚未回覆" severity="danger" class="ml-auto mr-2"/>
          <Badge v-else value="已回覆" severity="success" class="ml-auto mr-2"/>
        </span>
      </AccordionHeader>

      <AccordionContent>
        <p class="m-0">{{ item.comment }}</p>

        <div v-if="item.reply" class="reply-box mt-3 p-3">
          <strong class="text-success">業者回覆：</strong>
          <p class="mt-1">{{ item.reply }}</p>

          <!-- 時間靠右、淡灰色 -->
          <div class="reply-timestamp">
            {{ item.createdDate }}
            <span v-if="item.updatedDate"> (已編輯 {{ item.updatedDate }})</span>
          </div>

          <div class="btn-container mt-2">
            <button class="btn btn-primary" @click="emitOpen('modify', item)">修改回覆</button>
          </div>
        </div>

        <div v-else class="btn-container">
          <button class="btn btn-primary" @click="emitOpen('insert', item)">新增回覆</button>
        </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>


<script setup>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';

const photoPath = import.meta.env.VITE_PROFILE_PHOTO_URL; 
const props = defineProps({ reviews: Array });
const emits = defineEmits(['open-modal']);

console.log("review" + JSON.stringify(props.reviews));


const API_BASE_URL = 'http://192.168.25.152:8080';


// function getImageUrl(imagePath) {
//   if (!imagePath) return `${API_BASE_URL}/images/hotel-reply.png`;
//   return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
// }


function handleImageError(event) {
  event.target.src = `${API_BASE_URL}/images/hotel-reply.png`;
}


function emitOpen(action, item) {
  emits('open-modal', action, item);
}
</script>
<style scoped>
.reply-box {
  border-left: 4px solid #28a745;
  background: #f7fff8;
  border-radius: 6px;
}


/* 按鈕容器 */
.btn-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
}


/* 所有按鈕共用樣式 */
button.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  color: white;
  font-weight: 500;
}


/* 新增回覆按鈕 - 明亮綠 */
button.btn-primary {
  background-color: #28a745;
}


button.btn-primary:hover {
  background-color: #218838;
}


/* 修改回覆按鈕 - 稍深綠 */
button.btn-success {
  background-color: #20c997;
}


button.btn-success:hover {
  background-color: #17a589;
}


/* 刪除回覆按鈕 - 深綠紅色替代（可用深綠或紅色視覺） */
button.btn-danger {
  background-color: #1e7e34;
}


button.btn-danger:hover {
  background-color: #155724;
}


/* Accordion 內容區塊修正 */
:deep(.p-accordion-content) {
  background-color: white !important;
  padding: 10px !important;
}
/* 回覆時間樣式 */
.reply-timestamp {
  text-align: right;
  color: #6c757d; /* 淡灰色 */
  font-size: 0.875rem; /* 較小字 */
  margin-top: 8px;
}
</style>

