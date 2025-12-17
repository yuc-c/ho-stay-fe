<template>
  <div class="container py-4">

    <div class="card shadow-sm mx-auto" style="max-width: 600px;">
      <div class="card-body">

        <h3 class="mb-3">
          <i class="bi bi-pencil-square"></i> 撰寫評論（訂單 #{{ bookingId }})
        </h3>

        <div class="mb-3">
          <label class="form-label">評分</label>
          <select v-model="rating" class="form-select">
            <option :value="5">★★★★★ 5 - 非常滿意</option>
            <option :value="4">★★★★ 4 - 滿意</option>
            <option :value="3">★★★ 3 - 普通</option>
            <option :value="2">★★ 2 - 不滿意</option>
            <option :value="1">★ 1 - 非常不滿意</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">評論內容</label>
          <textarea
            v-model="comment"
            class="form-control"
            rows="5"
            placeholder="請分享您的住宿體驗..."
          ></textarea>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-secondary" @click="goBack">
            返回
          </button>
          <button class="btn btn-primary" @click="handleSubmit">
            送出評論
          </button>
        </div>

        <p v-if="message" class="text-success mt-3">
          {{ message }}
        </p>

      </div>
    </div>

  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// 從網址讀 bookingId，例如 /review/create/1
const bookingId = route.params.bookingId;

const rating = ref(5);
const comment = ref("");
const message = ref("");

const handleSubmit = () => {
  if (!comment.value.trim()) {
    message.value = "請至少寫一點評論內容喔～";
    return;
  }

  // 目前先不連後端／不存資料，只是示範流程
  console.log("送出評論", {
    bookingId,
    rating: rating.value,
    comment: comment.value,
  });

  message.value = "已假裝送出評論（之後可以再串後端或 mock）";

  // 簡單一點：兩秒後導回 /orders
  setTimeout(() => {
    router.push("/orders");
  }, 1500);
};

const goBack = () => {
  router.push("/orders");
};
</script>

<style scoped>
.review-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.review-form {
  margin-top: 16px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

select,
textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.button-group {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #2c7be5;
  color: #fff;
}

.message {
  margin-top: 12px;
  color: #2c7be5;
}
</style>
