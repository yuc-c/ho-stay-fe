<template>
    <!-- 返回 -->
    <button class="btn btn-link text-dark mb-3" @click="goBack">
        ← Back
    </button>

    <h3 class="fw-bold mb-4">
        {{ isEdit ? "編輯文章" : "新增文章" }}
    </h3>

    <!-- 狀態 -->
    <label class="form-label fw-semibold">狀態</label>
    <div class="d-flex mb-3" style="max-width: 400px;">
        <select v-model="form.status" class="form-select me-2">
            <option :value="0">草稿</option>
            <option :value="1">已發佈</option>
        </select>
    </div>

    <!-- 分類選擇 -->
    <label class="form-label fw-semibold">分類選擇</label>
    <select v-model="form.categoryId" class="form-select mb-3">
        <option disabled value="">所有分類</option>
        <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
            {{ cat.name }}
        </option>
    </select>

    <!-- 標題 -->
    <label class="form-label fw-semibold">文章標題</label>
    <input v-model="form.title" class="form-control mb-3" placeholder="請輸入文章標題" />

    <!-- 內容 -->
    <label class="form-label fw-semibold">內容</label>
    <div class="editor-wrapper mb-4">
        <div id="editor" class="quill-editor"></div>
    </div>
    <!-- 儲存 -->
    <button class="btn btn-sm btn-outline-dark w-100 py-2" @click="submitArticle">
        儲存
    </button>


    <!-- Toast -->
    <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom: 20px; right: 20px; z-index: 9999;">
        {{ toastMessage }}
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/admin/api/axios'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

import useUserStore from "@/user/stores/user.js"
const userStore = useUserStore();

const rawUser = JSON.parse(sessionStorage.getItem("hoUser"))
const adminUserId = rawUser?.userId

/* 判斷用新增還是編輯按鈕進入ArticleCreate.vue */
import { useRoute } from 'vue-router'
const route = useRoute();
const isEdit = ref(false);
const articleId = ref(null);
async function loadArticle(id) {
    try {
        const res = await axios.get(`/api/questions/${id}`);
        const q = res.data;

        form.value.status = q.status;
        form.value.categoryId = q.category?.categoryId;
        form.value.title = q.title;
        form.value.content = q.content;

        // 將文章內容塞進 Quill
        editor.value.root.innerHTML = q.content;
    } catch (err) {
        console.error("文章載入失敗", err);
        showToast("載入文章失敗");
    }
}



const categories = ref([])
const editor = ref(null)

const form = ref({
    status: 0,
    categoryId: '',
    title: '',
    content: ''
})

function goBack() {
    history.back()
}

async function fetchCategories() {
    try {
        const res = await axios.get('/api/questions/category')
        categories.value = res.data
    } catch (err) {
        console.error('分類載入失敗', err)
    }
}

// Toast
const toastMessage = ref("")
const showToastFlag = ref(false)

function showToast(msg) {
    toastMessage.value = msg
    showToastFlag.value = true
    setTimeout(() => showToastFlag.value = false, 2000)
}

// 儲存文章
async function submitArticle() {
    const contentHtml = editor.value.root.innerHTML;
    form.value.content = editor.value.root.innerHTML;

    try {
        if (isEdit.value) {
            // 編輯模式
            await axios.put(`/api/questions/${articleId.value}`, {
                title: form.value.title,
                content: form.value.content,
                status: form.value.status,
                categoryId: form.value.categoryId
            },
                {
                    headers: {
                        "userId": adminUserId   // ✨ 一定要加
                    }
                }
            );
            showToast("更新成功！");
        } else {
            // 新增模式
            await axios.post('/api/questions', {
                title: form.value.title,
                content: form.value.content,
                status: form.value.status,
                categoryId: form.value.categoryId,
            },
                {
                    headers: {
                        "userId": adminUserId   // ✨ 一定要加
                    }
                }
            );
            showToast("新增成功！");
        }

        setTimeout(() => goBack(), 1200);

    } catch (err) {
        console.error("操作失敗", err);
        showToast("儲存失敗");
    }
}

onMounted(async () => {
    await fetchCategories();

    // 初始化 Quill
    editor.value = new Quill('#editor', {
        theme: 'snow',
        placeholder: '請輸入文章內容...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'font': [] }],
                [{ 'size': [] }],
                ['bold', 'italic', 'underline'],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['image']
            ]
        }
    });

    // 判斷是否為編輯文章
    if (route.params.id) {
        isEdit.value = true;
        articleId.value = route.params.id;

        // 等 Quill 初始化後再載入文章內容
        loadArticle(articleId.value);
    }

    const toolbar = editor.value.getModule('toolbar');
    toolbar.addHandler('image', handleImageUpload);
});

const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('圖片大小不能超過 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 使用完整路徑（包含 /api）
            const res = await axios.post('/api/questions/upload/faq', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'userId': adminUserId
                }
            });

            let imageUrl = res.data.url; // "/uploads/faq/xxx.png"

            // 使用環境變數組合完整 URL
            const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || 'http://192.168.25.152:8080';
            const fullImageUrl = fileBaseUrl + imageUrl;

            console.log('完整圖片 URL:', fullImageUrl);

            if (!editor.value) {
                showToast('編輯器錯誤');
                return;
            }

            // 取得當前內容
            const currentContent = editor.value.root.innerHTML;

            // 建立圖片 HTML
            const imageHtml = `<p><img src="${fullImageUrl}" alt="上傳圖片" style="max-width: 100%; height: auto;" /></p><p><br></p>`;

            // 附加到內容最後
            editor.value.root.innerHTML = currentContent + imageHtml;

            showToast('圖片上傳成功！');

        } catch (error) {
            console.error("圖片上傳失敗:", error);
            showToast('圖片上傳失敗！');
        }
    };
};

</script>

<style scoped>
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
    padding-top: 2rem;
}

.editor-wrapper {
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    height: 300px;
    overflow-y: auto;
    padding: 0;
}

.quill-editor {
    border: none !important;
    /* 移除 Quill 自己的背景框線 */
}

.quill-editor .ql-editor {
    min-height: 100%;
    height: auto;
    padding: 12px 14px;
    /* 讓內容不會緊貼邊界 */
}

.quill-editor .ql-container {
    border: none !important;
    /* 去邊框 */
}

/* 整個編輯器外框 */
.editor-wrapper {
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
    max-height: 450px;
    /* 👉 可自行調整高度 */
    display: flex;
    flex-direction: column;
}

/* Quill 工具列固定 */
.editor-wrapper .ql-toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    border-bottom: 1px solid #E2E8F0;
}

/* 內容區可獨立捲動 */
.editor-wrapper .ql-container {
    flex: 1;
    overflow-y: auto;
    /* ⭐只讓內容捲動 */
}

/* 編輯區內文字的 padding（更好看） */
.editor-wrapper .ql-editor {
    min-height: 200px;
    padding: 16px;
}
</style>