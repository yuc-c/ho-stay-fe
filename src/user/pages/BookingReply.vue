<template>
  <h3 class="text-center mb-4">顧客留下了寶貴的評論，快來回覆吧</h3>
  <div v-for="hotel in hotels" :key="hotel.id" class="mb-5">
    <h4>{{ hotel.name }}</h4>
    <div v-if="!reviewsByHotel[hotel.id] || reviewsByHotel[hotel.id].length === 0" class="text-gray-500">
      目前還沒有評論
    </div>
  <div v-else>
      <!-- 分頁 -->
      <Paginator
        :rows="rows"
        :totalRecords="reviewsByHotel[hotel.id].length"
        v-model:first="firstByHotel[hotel.id]"
        @page="onPageChange(hotel.id, $event)"
        class="mb-3"
      />
      <div class="row">
        <BookingReplyAccordion
          :reviews="reviewsByHotel[hotel.id].slice(firstByHotel[hotel.id] || 0, (firstByHotel[hotel.id] || 0) + rows)"
          @open-modal="openModal"
        />
      </div>
    </div>
  </div>

  <!-- Modal -->
  <BookingReplyModal
    v-if="modalVisible"
    :action="modalAction"
    :review="currentReview"
    @insert="insertReply"
    @modify="modifyReply"
    @close="modalVisible = false"
  />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Swal from 'sweetalert2';
import myAxios from '@/user/plugin/axios.js';
import BookingReplyAccordion from '@/user/components/BookingReplyAccordion.vue';
import BookingReplyModal from '@/user/components/BookingReplyModal.vue';
import Paginator from 'primevue/paginator';
import useUserStore from '@/user/stores/user.js';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const userStore = useUserStore();
const hotels = ref([]);
const reviewsByHotel = reactive({});
const firstByHotel = reactive({});
const rows = 5;
const modalVisible = ref(false);
const modalAction = ref('');
const currentReview = ref(null);


async function fetchHotelsAndReviews() {
  try {


    const res = await myAxios.get(`${API_BASE_URL}/api/hotelreviews/owner`, {
      headers: { userId: userStore.userId }
    });

    hotels.value = res.data.map(item => item.hotel);

    res.data.forEach(item => {
      reviewsByHotel[item.hotel.id] = (item.reviews || []).map(r => ({
        ...r,
        hotelId: item.hotel.id,
        hotelName: item.hotel.name,
        user: {
          firstName: r.firstName,
          lastName: r.lastName,
          image: r.image
        }
      }));
      firstByHotel[item.hotel.id] = 0;
    });

  } catch (err) {
    console.error('Error fetching reviews:', err);
  }
}

// 打開 Modal
function openModal(action, review) {
  modalAction.value = action;
  currentReview.value = review;
  modalVisible.value = true;
}

// 分頁
function onPageChange(hotelId, event) {
  firstByHotel[hotelId] = event.first;
}

// 新增回覆
async function insertReply(review) {
  console.log("hahaha:", review);
  try {
    
    const res = await myAxios.post(`${API_BASE_URL}/api/hotelreviews/reply`, {
      id: review.reviewId,
      reply: review.reply.trim()
    });

    // 後端回傳的 reply 與 updatedDate
    review.reply = res.data.reply; // 字串
    review.replyCreatedDate = res.data.replyCreatedDate;
    review.replyUpdatedDate = res.data.replyUpdatedDate;


    const hotelReviews = reviewsByHotel[review.hotelId];
    const index = hotelReviews.findIndex(r => r.reviewId === review.reviewId);
    if (index !== -1) hotelReviews[index] = review;
    Swal.fire({ icon: 'success', title: '回覆成功', timer: 1500, showConfirmButton: false });
    modalVisible.value = false;
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: '回覆失敗', text: '請稍後再試' });
  }
}

// 修改回覆
async function modifyReply(review) {
  try {
    const res = await myAxios.post(`${API_BASE_URL}/api/hotelreviews/reply`, {
      id: review.reviewId,
      reply: review.reply.trim()  // <-- 直接用字串
    });

    // 後端回傳的 reply 與日期
    review.reply = res.data.reply;
    review.replyCreatedDate = res.data.replyCreatedDate;
    review.replyUpdatedDate = res.data.replyUpdatedDate;

    const hotelReviews = reviewsByHotel[review.hotelId];
    const index = hotelReviews.findIndex(r => r.reviewId === review.reviewId);
    if (index !== -1) hotelReviews[index] = review;

    Swal.fire({ icon: 'success', title: '修改成功', timer: 1500, showConfirmButton: false });
    modalVisible.value = false;
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: '修改失敗', text: '請稍後再試' });
  }
}



onMounted(fetchHotelsAndReviews);
</script>

<style scoped>
h3 { color: #279f6a; font-weight: 700; }
h4 { margin-bottom: 10px; color: #333; }
.text-gray-500 { color: #6b7280; padding: 20px; text-align: center; font-style: italic; }
.mb-5 { padding-left: 20px; padding-right: 20px; }
.row { padding-left: 20px; }
</style>