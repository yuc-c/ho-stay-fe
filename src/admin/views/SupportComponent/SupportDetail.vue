<template>
    <!-- 返回與標題 -->
    <div class="d-flex align-items-center mb-4">
        <button class="btn btn-link text-dark me-3" @click="goBack">← Back</button>
        <h5 class="fw-bold mb-0">案件詳情</h5>
    </div>

    <!-- 案件標頭 + 客戶留言 -->
    <div class="card p-3 mb-3">
        <!-- 第一層：案件標頭 -->
        <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <div>
                <span class="me-3 fw-bold">
                    <i class="bi bi-person"></i> {{ supportDetail.user?.firstName || '—' }}
                </span>
                <span class="case-code2 me-3">{{ supportDetail.caseCode }}</span>
                <span class="badge bg-secondary me-3">{{ supportDetail.sCategory?.name }}</span>
                <span>{{ supportDetail.title }}</span>
            </div>
            <div class="text-end mt-2 mt-sm-0">
                <span class="me-3">{{ formatDate(supportDetail.createdTime) }}</span>
                <span class="badge" :class="{
                    'bg-undone text-dark': supportDetail.status === 0,
                    'bg-handling': supportDetail.status === 1,
                    'bg-complete': supportDetail.status === 2
                }">
                    {{ statusText }}
                </span>
            </div>
        </div>

        <!-- 第二層：客戶留言 -->
        <div class="bg-light p-3 rounded">

            <p class="mb-0">{{ supportDetail.content || '（無內容）' }}</p>
        </div>
        <div v-if="supportDetail.photos && supportDetail.photos.length > 0" class="mt-3 d-flex flex-wrap">
            <img v-for="p in supportDetail.photos" :key="p.photoId" :src="fileBaseUrl + p.url" class="support-thumb"
                @click="openImage(fileBaseUrl + p.url)">
        </div>
    </div>

    <!-- 修正問題類別區塊 -->
    <div class="card p-3 mb-3">
        <div class="d-flex align-items-center">

            <!-- 左側標題 -->
            <label class="fw-semibold me-3 mb-0">客服類別修正：</label>

            <!-- 下拉 + 按鈕放同一行 -->
            <select v-model="selectedCategory" class="form-select form-select-sm me-2" style="width: 200px;">
                <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                    {{ cat.name }}
                </option>
            </select>

            <button class="btn btn-outline-dark btn-sm d-flex align-items-center" @click="updateCategory">
                更新
            </button>

        </div>
    </div>


    <!-- 歷史回覆紀錄 -->
    <div ref="chatBox" class="chat-box mb-3">
        <div v-for="reply in replies" :key="reply.replyId" class="chat-message" :class="{ admin: isAdmin(reply) }">
            <div class="meta">
                <i class="bi bi-person me-1"></i>
                <strong>{{ formatUserName(reply.userName) }}</strong>
                <small class="text-muted ms-2">{{ formatDate(reply.createdTime) }}</small>
            </div>
            <div class="message p-3 rounded mt-1 shadow-sm">
                {{ reply.content }}
            </div>
            <!-- 顯示縮圖 -->
            <div v-if="reply.photos && reply.photos.length > 0" class="image-list mt-2">
                <img v-for="p in reply.photos" :key="p.photoId" :src="fileBaseUrl + p.url" class="reply-thumb"
                    @click="openImage(fileBaseUrl + p.url)">
            </div>
        </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxImage" class="lightbox" @click="lightboxImage = null">
        <img :src="lightboxImage" class="lightbox-img">
    </div>

    <!-- 回覆區 -->
    <div v-if="supportDetail.status !== 2" class="reply-section mt-3">
        <textarea v-model="newReply" class="form-control mb-2" rows="4" placeholder="輸入回覆內容"></textarea>

        <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
                <!-- 添加圖片按鈕 -->
                <label class="btn btn-outline-dark btn-sm me-3 d-flex align-items-center">
                    <i class="bi bi-image me-1"></i> 添加圖片
                    <input type="file" accept="image/*" @change="handleFileChange" hidden>
                </label>

                <!-- 顯示檔名與取消 -->
                <div v-if="selectedFile" class="d-flex align-items-center">
                    <span class="small text-muted">{{ selectedFile.name }}</span>
                    <span class="text-danger small ms-2 cancel-btn" @click="cancelFile">× 取消</span>
                </div>
            </div>

            <div class="d-flex align-items-center">



                <!-- 回覆按鈕 -->
                <button class="btn btn-outline-dark btn-sm d-flex align-items-center ms-auto" @click="sendReply">
                    回覆
                </button>
            </div>
        </div>
    </div>


    <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom: 20px; right: 20px; z-index: 9999;">
        {{ toastMessage }}
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import axios from '@/admin/api/axios'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from "@/user/stores/user.js";
const userStore = useUserStore();

// 讀取.env //
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL;

const router = useRouter()
const route = useRoute()
const supportId = route.params.id

const supportDetail = ref({})
const replies = ref([])
const newReply = ref('')
const selectedFile = ref(null)
const chatBox = ref(null)

const categories = ref([])
const selectedCategory = ref(null)

const lightboxImage = ref(null)

// 歷史回覆區的圖片 控制
function openImage(url) {
    lightboxImage.value = url
}

// 狀態文字
const statusText = computed(() => {
    if (supportDetail.value.status === 0) return '未處理'
    if (supportDetail.value.status === 1) return '處理中'
    if (supportDetail.value.status === 2) return '已結案'
    return '未知'
})

// 判斷是否為管理員
function isAdmin(reply) {
    return reply.roleId === 1;   // 管理員 roleId = 1
}


function formatUserName(name) {
    if (!name) return '—'
    return name.replace(',', ' ')
}



// 修改客服類別選單
function fetchCategories() {
    axios.get('/api/support/category')
        .then(res => {
            categories.value = res.data
        })
        .catch(err => console.error("分類載入失敗", err))
}

// 取得案件內容
function fetchSupportDetail() {
    axios.get(`/api/support/${supportId}`)
        .then(res => {
            supportDetail.value = res.data
            selectedCategory.value = res.data.sCategory?.categoryId || null
        })
        .catch(err => console.error('無法取得案件資料', err))
}


const toastMessage = ref("");
const showToastFlag = ref(false);

function showToast(message) {
    toastMessage.value = message;
    showToastFlag.value = true;

    setTimeout(() => {
        showToastFlag.value = false;
    }, 2000);
}
function updateCategory() {
    if (!selectedCategory.value) return;
    axios.put(`/api/support/${supportId}/category`, {
        categoryId: selectedCategory.value
    })
        .then(() => {
            showToast("分類更新成功！");
            fetchSupportDetail();
        })
        .catch(err => console.error("分類更新失敗", err));
}

// 取得回覆資料
function fetchReplies() {
    axios.get(`/api/support/reply/support/${supportId}`)
        .then(res => {
            replies.value = res.data
            nextTick(() => scrollToBottom()) // 自動捲到底
            console.log('回覆資料', replies.value)
        })
        .catch(err => console.error('無法取得回覆資料', err))
}

// 自動捲到最底
function scrollToBottom() {
    if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
}

// === 發送回覆（文字 + 可選照片） ===
const currentUserId = JSON.parse(sessionStorage.getItem("hoUser")).userId;
async function sendReply() {
    if (!newReply.value.trim() && !selectedFile.value) {
        alert("請輸入回覆內容或上傳圖片")
        return
    }

    const formData = new FormData();

    formData.append("supportId", supportId);

    formData.append("content", newReply.value);

    if (selectedFile.value) {
        formData.append("photos", selectedFile.value);
    }

    try {
        await axios.post("/api/support/reply", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "userId": JSON.parse(sessionStorage.getItem("hoUser")).userId
            }
        });

        // 清空輸入
        newReply.value = "";
        selectedFile.value = null;

        // 重新載入回覆
        fetchReplies();

        showToast("回覆已送出！");
    } catch (err) {
        console.error("回覆失敗", err);
        alert("回覆失敗，請檢查後端是否正常");
    }
}

function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    if (!validTypes.includes(file.type)) {
        alert('只允許上傳圖片檔案（jpg、jpeg、png、gif）')
        e.target.value = ''
        return
    }

    selectedFile.value = file
}

function cancelFile() {
    selectedFile.value = null
}

function goBack() {
    router.push('/admin/supportList')
}

function formatDate(dateString) {
    if (!dateString) return '—'
    const date = new Date(dateString.replace(' ', 'T'))
    return date.toLocaleString('zh-TW', { hour12: false })
}

onMounted(() => {
    fetchSupportDetail()
    fetchReplies()
    fetchCategories()
})
</script>

<style scoped>
/* ========================= */
/* Layout（僅保留排版設定） */
/* ========================= */

.case-code2 {
    color: #2b5f75 !important;
    font-weight: 600;

}

.layout-wrapper {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

.sidebar {
    width: 250px;
    flex-shrink: 0;
}

.main-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 2rem 2.5rem;
}


.support-thumb {
    width: 120px;
    height: 120px;
    object-fit: cover;
    margin-right: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    border: 1px solid #ddd;
    transition: 0.2s ease;
}

.support-thumb:hover {
    transform: scale(1.05);
}

/* ========================= */
/* 回覆區：取消按鈕          */
/* ========================= */
.cancel-btn {
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s ease;
}

.cancel-btn:hover {
    color: #b30000;
    text-decoration: underline;
}


/* ========================= */
/* 聊天紀錄外框（頁面專屬） */
/* ========================= */
.chat-box {
    background: #ffffff;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    max-height: 300px;
    overflow-y: auto;
}


/* ========================= */
/* 聊天訊息（泡泡樣式）      */
/* ========================= */
.chat-message {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* 預設都靠左 */
}

.chat-message .meta {
    font-size: 0.85rem;
    color: #6b7280;
}

/* 泡泡本體 */
.chat-message .message {
    display: inline-block;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 10px 14px;
    max-width: 70%;
    word-break: break-word;
}

/* 附圖列 */
.chat-message .image-list {
    margin-top: 6px;
    display: flex;
    gap: 6px;
}

/* 管理員訊息：靠右（泡泡 + 圖片一起推到右側） */
.chat-message.admin .message,
.chat-message.admin .image-list {
    margin-left: auto;
}

/* 管理員訊息的顏色維持你原本的設定 */
.chat-message.admin .message {
    background-color: #eef2f0;
    border-color: #cfd8d4;
}

/* 管理員的 meta 文案也往右對齊 */
.chat-message.admin .meta {
    align-self: flex-end;
    text-align: right;
}



/* ========================= */
/* 縮圖樣式                  */
/* ========================= */
.reply-thumb {
    width: 100px;
    height: 100px;
    object-fit: cover;
    cursor: pointer;
    margin-top: 6px;
    margin-right: 6px;
    border: 1px solid #d1d5db;
    transition: transform 0.2s ease;
}

.reply-thumb:hover {
    transform: scale(1.05);
}


/* ========================= */
/* Lightbox 放大查看圖片     */
/* ========================= */
.lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

/* ========================= */
/* textarea    */
/* ========================= */

.reply-section textarea {
    height: 100px;
    max-height: 100px;
    /* 防止隨內容撐高 */
    resize: none;
    overflow-y: auto;
    /* 出現捲軸 */
}
</style>
