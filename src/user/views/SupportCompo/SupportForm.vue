<template>
    <div>
        <h3 class="fw-bold mb-3">聯繫客服</h3>

        <!-- 問題分類 -->
        <div class="form-group mb-3">
            <label class="form-label">問題類別</label>
            <select v-model="form.categoryId" class="form-select">
                <option disabled value="">請選擇問題類別</option>
                <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
                    {{ c.name }}
                </option>
            </select>
            <small v-if="errors.categoryId" class="text-danger">{{ errors.categoryId }}</small>
        </div>

        <!-- 訂單編號 -->
        <div class="form-group mb-3">
            <label class="form-label">訂單編號（選填）</label>
            <input v-model="form.bookingId" class="form-control" placeholder="輸入完整訂單編號" />
        </div>

        <!-- 主旨 -->
        <div class="form-group mb-3">
            <label class="form-label">主旨</label>
            <input v-model="form.title" class="form-control" />
            <small v-if="errors.title" class="text-danger">{{ errors.title }}</small>
        </div>

        <!-- 問題內容 -->
        <div class="form-group mb-3">
            <label class="form-label">問題內容</label>
            <textarea v-model="form.content" rows="4" class="form-control"></textarea>
            <small v-if="errors.content" class="text-danger">{{ errors.content }}</small>
        </div>

        <!-- 圖片上傳（多張） -->
        <div class="form-group mb-3">
            <label class="form-label">選擇圖片</label>
            <input type="file" multiple class="form-control" @change="handleFileUpload" ref="fileInput" />
        </div>
        <!-- 檔名 + X 按鈕 -->
        <div v-if="photos.length" class="mt-2">
            <div v-for="(file, index) in photos" :key="index" class="d-flex align-items-center mb-1"
                style="font-size: 14px;">
                <span class="me-2">{{ file.name }}</span>
                <button type="button" @click="removePhoto(index)"
                    style="background:none; border:none; color:red; font-weight:600; cursor:pointer;"
                    @mouseover="($event.target.style.textDecoration = 'underline')"
                    @mouseleave="($event.target.style.textDecoration = 'none')">
                    ×
                </button>

            </div>
        </div>
        <br></br>
        <button class="btn btn-dark-2 w-100" @click="submitForm">
            送出
        </button>

        <!-- Toast -->
        <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom:20px; right:20px; z-index:9999;">
            {{ toastMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import supportAxios from "@/user/plugin/supportAxios";

import useUserStore from "@/user/stores/user.js";
const userStore = useUserStore();

const emit = defineEmits(["submitted"]);

// 表單內容
const form = ref({
    categoryId: "",
    bookingId: "",
    title: "",
    content: "",
});

// 多張圖片的暫存
const photos = ref([]);

// 從後端取得 sCategory（客服分類）
const categories = ref([]);

const loadCategories = async () => {
    const res = await supportAxios.get("/api/support/category");
    categories.value = res.data;
};

// 接收圖片
const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    photos.value.push(...files);
    if (fileInput.value) {
        fileInput.value.value = "";
    }
};

// 移除單張圖片
const removePhoto = (index) => {
    photos.value.splice(index, 1);
};

//圖片選擇完變回placeholder
const fileInput = ref(null);


// 送出表單
const submitForm = async () => {
    if (!validateForm()) return; // 不通過就不送出

    const fd = new FormData();
    fd.append("categoryId", form.value.categoryId);
    fd.append("bookingId", form.value.bookingId);
    fd.append("title", form.value.title);
    fd.append("content", form.value.content);

    photos.value.forEach((file) => {
        fd.append("photos", file);
    });

    try {
        const res = await supportAxios.post("/api/support", fd, {
            headers: { "Content-Type": "multipart/form-data", "userId": userStore.userId },
        });

        console.log("後端回傳：", res.data);

        emit("submitted");
        showToast("已成功送出客服案件！");

        // 清空內容（恢復 placeholder）
        form.value = {
            categoryId: "",
            bookingId: "",
            title: "",
            content: ""
        };
        photos.value = [];

    } catch (err) {
        console.error("送出客服案件失敗", err);
    }
};


//表單內容錯誤提示
const errors = ref({
    categoryId: "",
    title: "",
    content: ""
});

const validateForm = () => {
    errors.value = { categoryId: "", title: "", content: "" };

    let valid = true;

    if (!form.value.categoryId) {
        errors.value.categoryId = "請選擇問題類別";
        valid = false;
    }
    if (!form.value.title) {
        errors.value.title = "主旨不可為空";
        valid = false;
    }
    if (!form.value.content) {
        errors.value.content = "問題內容不可為空";
        valid = false;
    }

    return valid;
};

onMounted(loadCategories);

/* Toast */
const toastMessage = ref("")
const showToastFlag = ref(false)
function showToast(msg) {
    toastMessage.value = msg
    showToastFlag.value = true
    setTimeout(() => showToastFlag.value = false, 2000)
}

</script>

<style scoped>
.btn-dark-2 {
    background-color: #0a8a75;
    border-color: #0a8a75;
    color: white;
    width: 150px;
}

.btn-dark-2:hover {
    background-color: #065043;
    border-color: #065043;
    color: rgb(255, 255, 255);
    width: 150px;
}

textarea {
    height: 120px;
    resize: none;
}
</style>