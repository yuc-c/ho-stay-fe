<template>
    <transition name="drawer-slide">
        <div v-if="show" class="drawer-overlay " @click.self="close">
            <div class="drawer support-detail">

                <!-- Header -->
                <div class="drawer-header d-flex justify-content-between">
                    <h4>{{ support?.title }}</h4>
                    <button class="btn-close" @click="close"></button>
                    <!-- 案件標頭 -->

                </div>
                <!-- Wrapper for B + C 區 -->
                <div class="drawer-content-rows">

                    <!-- B 區（左側） -->
                    <div class="case-header mb-4">
                        <div class="text-muted small mb-1">{{ support.caseCode }}</div>
                        <span :class="['status-badge', statusClass(support.status)]">
                            {{ statusText(support.status) }}
                        </span>

                        <!-- 問題內容（可展開 + 卷軸） -->
                        <div class="content-wrapper mt-2">
                            <div class="text-muted small mb-1">問題內容</div>

                            <div class="content-box" :class="{ collapsed: !showContent }">
                                {{ support.content }}

                                <div v-if="support.photos?.length" class="support-photos mt-2">
                                    <img v-for="p in support.photos" :key="p.photoId" :src="fileBaseUrl + p.url"
                                        class="support-photo-thumb" @click="openImage(fileBaseUrl + p.url)" />
                                </div>
                            </div>

                            <button type="button" class="btn-link-toggle" @click="toggleContent">
                                {{ showContent ? '收合內容' : '展開內容' }}
                            </button>
                        </div>
                    </div>
                    <hr />


                    <!-- C 區（右側） -->
                    <div class="right-section">

                        <!-- 歷史回覆 -->
                        <div class="drawer-body">
                            <div ref="chatBox" class="chat-box mb-3">
                                <div v-for="reply in replies" :key="reply.replyId" class="chat-message"
                                    :class="{ admin: isAdmin(reply) }">

                                    <div class="meta d-flex align-items-center">
                                        <i class="bi bi-person me-1"></i>
                                        <strong>{{ formatUserName(reply) }}</strong>
                                        <small class="text-muted ms-2">{{ formatDate(reply.createdTime) }}</small>
                                    </div>

                                    <div class="message p-3 rounded mt-1 shadow-sm">
                                        {{ reply.content }}

                                        <div v-if="reply.photos?.length" class="image-list mt-2">
                                            <img v-for="p in reply.photos" :key="p.photoId"
                                                :src="`${fileBaseUrl}/api/support/rphotos/photo/${p.photoId}`"
                                                class="reply-thumb"
                                                @click="openImage(`${fileBaseUrl}/api/support/rphotos/photo/${p.photoId}`)" />
                                        </div>
                                    </div>
                                    <div v-if="replies.length === 0" class="no-reply">
                                        無回覆紀錄
                                    </div>
                                </div>

                            </div>


                            <!-- 回覆區 -->
                            <div class="reply-section">
                                <textarea v-model="newReply" class="form-control mb-2" rows="4" placeholder="輸入回覆內容"
                                    :disabled="support.status === 2"></textarea>

                                <div class="d-flex align-items-center justify-content-between">

                                    <div class="d-flex align-items-center">
                                        <label class="btn btn-outline-dark btn-sm me-3 d-flex align-items-center"
                                            :class="{ disabled: support.status === 2 }"
                                            :style="support.status === 2 ? 'pointer-events:none; opacity:0.5;' : ''">

                                            <i class="bi bi-image me-1"></i> 添加圖片
                                            <input type="file" accept="image/*" @change="handleFileChange" hidden
                                                :disabled="support.status === 2">
                                        </label>

                                        <div v-if="selectedFile" class="d-flex align-items-center">
                                            <span class="small text-muted">{{ selectedFile.name }}</span>
                                            <span class="text-danger small ms-2" @click="cancelFile"
                                                v-if="support.status !== 2">×
                                                取消</span>
                                        </div>
                                    </div>

                                    <!-- 回覆按鈕：已結案 → disabled -->
                                    <button class="btn btn-dark-2 btn-outline-dark btn-sm" @click="sendReply"
                                        :disabled="support.status === 2">
                                        回覆
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div> <!-- drawer END -->
                </div>
                <!-- Lightbox -->
                <div v-if="lightboxImage" class="lightbox" @click="lightboxImage = null">
                    <img :src="lightboxImage" class="lightbox-img" />
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import useUserStore from "@/user/stores/user.js";
const userStore = useUserStore();


import { ref, watch, nextTick } from "vue";
import supportAxios from "@/user/plugin/supportAxios";

const props = defineProps({
    support: Object,
    show: Boolean
});

const emit = defineEmits(["close"]);
const close = () => emit("close");


// ---- 狀態 ----
const replies = ref([]);
const newReply = ref("");
const selectedFile = ref(null);
const lightboxImage = ref(null);
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL;
const chatBox = ref(null);

// ---- 載入回覆 ----
const loadReplies = async () => {
    if (!props.support?.supportId) return;

    const res = await supportAxios.get(`/api/support/reply/support/${props.support.supportId}`);
    replies.value = res.data;

    nextTick(() => {
        if (chatBox.value) {
            chatBox.value.scrollTop = chatBox.value.scrollHeight;
        }
    });
};

const showContent = ref(false); // 預設收合

const toggleContent = () => {
    showContent.value = !showContent.value;
};

watch(
    () => props.show,
    (val) => {
        if (!val) {
            showContent.value = false;
        }
    }
);

// ---- 判斷角色 ----
const isAdmin = (reply) => reply.roleId === 1;
const formatUserName = (reply) => {
    if (reply.roleId === 1) return "管理員";
    if (reply.roleId === 2) return reply.userName || "房客";
    if (reply.roleId === 3) return reply.userName || "房東";
    return reply.userName || "使用者";
};

// ---- 工具 ----
const formatDate = (d) => d?.replace("T", " ").substring(0, 19);
const statusText = (s) =>
    s === 0 ? "尚未回覆" : s === 1 ? "處理中" : "已結案";

const statusClass = (s) =>
    s === 0 ? "pending"
        : s === 1 ? "processing"
            : "closed";

// ---- 上傳圖片 ----
const handleFileChange = (e) => {
    selectedFile.value = e.target.files[0];
};
const cancelFile = () => (selectedFile.value = null);

// ---- 送出回覆 ----
const sendReply = async () => {
    if (!newReply.value.trim()) return;

    const fd = new FormData();
    fd.append("supportId", props.support.supportId);
    fd.append("content", newReply.value);

    if (selectedFile.value) fd.append("photos", selectedFile.value);

    await supportAxios.post("/api/support/reply", fd, {
        headers: {
            "Content-Type": "multipart/form-data",
            "userId": userStore.userId
        }
    });

    newReply.value = "";
    selectedFile.value = null;

    loadReplies();
};

// ---- Lightbox ----
const openImage = (url) => (lightboxImage.value = url);

// ---- 監聽 support 切換 ----
watch(() => props.support, loadReplies, { immediate: true });
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


/* Drawer 右側滑入動畫 */
.drawer-slide-enter-from,
.drawer-slide-leave-to {
    opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
    transition: all 0.35s ease;
}

/* 主體滑動：由右往左 */
.drawer-slide-enter-from .drawer,
.drawer-slide-leave-to .drawer {
    transform: translateX(100%);
}

.drawer-slide-enter-to .drawer,
.drawer-slide-leave-from .drawer {
    transform: translateX(0);
}



/* --- Drawer 外層 --- */
.drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: flex-end;
    z-index: 999;
}

.drawer {
    width: 500px;
    background: white;
    height: 100%;
    padding: 24px;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
}

/* --- Drawer Body --- */

/* 讓右側 C 區成為垂直排列 */
.right-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    /* 避免 flex 高度錯亂 */
}

.drawer-body {

    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    /* 必須，加了捲軸才會正常 */

}

/* 案件標頭 */
.case-header {
    flex-shrink: 0;
}

/* --- Chat Box --- */
.chat-box {
    overflow-y: auto;
    padding-right: 6px;
    margin-bottom: 5px;

    flex: 1 1 auto;
    /* grow, shrink in flexbox */

    height: 350px;


}

.chat-message {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    width: fit-content;
    max-width: 100%;
}


/* 使用者往右 */
.chat-message:not(.admin) {
    margin-left: auto;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}


/* 管理員朝左 */
.chat-message.admin {
    margin-right: auto;
    margin-left: 0;
    text-align: left;
}


/* 氣泡樣式 */
.message {
    padding: 10px 14px;
    border-radius: 12px;
    line-height: 1.5;
    width: fit-content;
    max-width: 280px;
    word-break: break-word;
}

.chat-message.admin .message {
    background: #e8f0fe;
    border: 1px solid #cfd9f5;
}

.chat-message:not(.admin) .message {
    background: #d1f5e0;
    border: 1px solid #b4eac7;
}


.no-reply {
    text-align: center;
    color: #999;
    padding: 20px 0;
    font-size: 14px;
}

/* meta */
.meta {
    font-size: 12px;
    color: #6b7280;
}

/* 縮圖 */
.reply-thumb {
    width: 150px;
    border-radius: 8px;
    cursor: pointer;
}

.image-list {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
}

.chat-message.admin .image-list {
    align-items: flex-start;
}



/* --- Footer（回覆區） --- */
.reply-section {
    flex-shrink: 0;
    padding: 12px 5px;
    background: #fff;
}

/* --- Lightbox --- */
.lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.lightbox-img {
    max-width: 90%;
    max-height: 90%;
    border-radius: 8px;
}

textarea {
    resize: none;
}

.status-badge {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 6px;
    color: #fff;
    font-weight: 600;
}

.status-badge.pending {
    background: #b3b3b3;
    /* 灰：尚未回覆 */
}

.status-badge.processing {
    background: #0a8a75;
    /* 深藍綠：處理中 */
}

.status-badge.closed {
    background: #d75335;
    /* 紅：已結案 */
}

.content-wrapper {
    margin-top: 4px;
}

/* 展開時：有固定高度 + 卷軸，避免擠壓聊天區 */
.content-box {
    font-size: 14px;
    color: #555;
    background: #f7f7f7;
    border-radius: 8px;
    border: 1px solid #eee;
    padding: 8px 10px;
    max-height: 160px;
    /* 展開時最多顯示高度 */
    overflow-y: auto;
    /* 超過就出現捲軸 */
}

/* 收合狀態：只顯示前面一小段 */
.content-box.collapsed {
    max-height: 40px;
    /* 收合時只露出一行多一點 */
    overflow: hidden;
}

/* 展開／收合連結 */
.btn-link-toggle {
    border: none;
    background: none;
    color: #1a9474;
    font-size: 12px;
    padding: 0;
    margin-top: 4px;
    cursor: pointer;
}

.btn-link-toggle:hover {
    text-decoration: underline;
}

.support-photos {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.support-photo-thumb {
    width: 120px;
    border-radius: 8px;
    cursor: pointer;
    object-fit: cover;
}


/* RWD */

@media screen and (max-width: 900px) and (orientation: landscape) {

    /* 讓 Drawer 全滿版 */
    .support-detail .drawer {
        width: 100%;
        height: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;
        background: #fff;
    }

    /* A 區：Header */
    .support-detail .drawer-header {
        flex-shrink: 0;
        padding: 16px 20px;
        border-bottom: 1px solid #ddd;
    }

    /* B + C 外層：橫向排列 */
    .support-detail .drawer-content-rows {
        flex: 1;
        display: flex;
        flex-direction: row;
        overflow: hidden;
        min-height: 0;
    }

    /* --------------------------- */
    /* B 區：左側案件內容 */
    /* --------------------------- */
    .support-detail .case-header {
        width: 38%;
        padding: 20px;
        border-right: 1px solid #ddd;
        overflow-y: auto;
        min-height: 0;
    }

    /* --------------------------- */
    /* C 區：右側聊天＋回覆區 */
    /* --------------------------- */
    .support-detail .right-section {
        width: 62%;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    /* 聊天外框成為可捲動容器 */
    .support-detail .drawer-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 20px;
        min-height: 0;
    }

    /* 聊天區固定高度＋捲軸 */
    .support-detail .chat-box {
        flex: 1;
        max-height: 50vh;
        /* 你可改，例如 40vh / 50vh */
        overflow-y: auto;
        margin-bottom: 16px;
        padding-right: 6px;
    }

    /* 回覆區固定在下方 */
    .support-detail .reply-section {
        flex-shrink: 0;
        padding: 12px 20px;
        border-top: 1px solid #ddd;
        background: #fff;
    }

    textarea {
        height: 50px;
    }
}

@media (max-width: 768px) {

    .support-detail .chat-box {
        flex: 1;
        max-height: 280px;
        /* 你可改，例如 40vh / 50vh */
        overflow-y: auto;
        margin-bottom: 16px;
        padding-right: 6px;
    }


    textarea {
        height: 50px;
    }
}
</style>
