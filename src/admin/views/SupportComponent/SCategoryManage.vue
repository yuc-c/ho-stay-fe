<template>


    <h2 class="page-title">案件類別維護</h2>

    <div class="d-flex">

        <!-- 左：新增分類 -->
        <div style="width: 280px;">
            <h5 class="fw-bold mb-2">新增客服分類：</h5>

            <div class="card p-4">

                <!-- 類別名稱 -->
                <div class="mb-3">
                    <label class="form-label">類別名稱</label>
                    <input v-model="form.name" class="form-control" placeholder="輸入名稱" />
                    <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
                </div>

                <!-- 說明 -->
                <div class="mb-3">
                    <label class="form-label">說明</label>
                    <textarea v-model="form.description" class="form-control" placeholder="內容簡述"></textarea>
                    <small v-if="errors.description" class="text-danger">{{ errors.description }}</small>
                </div>

                <button class="btn btn-outline-dark w-100" @click="createCategory">新增</button>
            </div>
        </div>

        <!-- 右：分類列表 -->
        <div class="flex-grow-1 ms-5 category-panel">
            <h5 class="fw-bold mb-2">客服案件類型：</h5>

            <div class="card p-4 scroll-area">
                <div v-for="c in categories" :key="c.categoryId" class="mb-3 category-item" @click="openEditModal(c)">
                    <div class="fw-bold category-title">{{ c.name }}</div>
                    <div class="text-muted small">{{ c.description }}</div>
                </div>
            </div>
        </div>

    </div>


    <!-- 編輯 Modal -->
    <div v-if="showModal" class="modal-mask" @click.self="closeModal">
        <div class="modal-container">

            <span class="modal-close" @click="closeModal">×</span>

            <h5 class="fw-bold mb-3">編輯分類</h5>

            <!-- 類別名稱 -->
            <div class="mb-3">
                <label class="form-label">類別名稱</label>
                <input v-model="editForm.name" class="form-control" />
                <small v-if="errorsEdit.name" class="text-danger">{{ errorsEdit.name }}</small>
            </div>

            <!-- 說明 -->
            <div class="mb-3">
                <label class="form-label">說明</label>
                <textarea v-model="editForm.description" class="form-control"></textarea>
                <small v-if="errorsEdit.description" class="text-danger">{{ errorsEdit.description }}</small>
            </div>

            <!-- 按鈕列 -->
            <div class="d-flex justify-content-between align-items-center mt-3">

                <button class="btn btn-sm btn-outline-danger-custom" :disabled="!canDelete"
                    @click="canDelete ? showDeleteConfirm = true : showToast('此分類正在使用中，無法刪除')">
                    刪除分類
                </button>

                <button class="btn btn-outline-dark btn-sm d-flex align-items-center" @click="updateCategory">
                    更新
                </button>
            </div>

        </div>
    </div>

    <!-- 刪除確認視窗 -->
    <div v-if="showDeleteConfirm" class="modal-mask" @click.self="showDeleteConfirm = false">
        <div class="confirm-container">

            <span class="modal-close" @click="showDeleteConfirm = false">×</span>
            <h6 class="fw-bold mb-4 text-center">確定要刪除此分類嗎？</h6>

            <div class="text-center">
                <button class="btn btn-sm btn-outline-danger-custom" @click="confirmDelete">
                    刪除
                </button>
            </div>

        </div>
    </div>

    <!-- Toast -->
    <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom:20px; right:20px; z-index:9999;">
        {{ toastMessage }}
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/admin/api/axios'
import useUserStore from "@/user/stores/user.js"
const userStore = useUserStore();

const rawUser = JSON.parse(sessionStorage.getItem("hoUser"))
const adminUserId = rawUser?.userId


/* ✦ 錯誤訊息（新增） */
const errors = ref({
    name: "",
    description: ""
})

/* ✦ 錯誤訊息（編輯） */
const errorsEdit = ref({
    name: "",
    description: ""
})

/* 所有分類 */
const categories = ref([])

/* 新增資料 */
const form = ref({
    name: '',
    description: ''
})

/* 編輯資料 */
const showModal = ref(false)
const editForm = ref({
    id: null,
    name: '',
    description: ''
})

/* 刪除確認 */
const showDeleteConfirm = ref(false)
const canDelete = ref(true)

/* Toast */
const toastMessage = ref("")
const showToastFlag = ref(false)

function showToast(message) {
    toastMessage.value = message
    showToastFlag.value = true
    setTimeout(function () {
        showToastFlag.value = false
    }, 2000)
}

/* 讀資料 */
async function loadCategories() {
    const res = await axios.get('/api/support/category')
    categories.value = res.data
}

/* ✦ 新增分類（含紅字檢查） */
async function createCategory() {
    errors.value.name = ""
    errors.value.description = ""

    if (!form.value.name) {
        errors.value.name = "請輸入分類名稱"
    }
    if (!form.value.description) {
        errors.value.description = "請輸入分類說明"
    }

    if (errors.value.name || errors.value.description) return

    const newCategory = {
        name: form.value.name,
        description: form.value.description
    }

    await axios.post('/api/support/category', newCategory, {
        headers: {
            "userId": adminUserId
        }
    });

    showToast("新增成功！")

    form.value = { name: '', description: '' }
    errors.value = { name: "", description: "" }

    loadCategories()
}

/* ✦ 開啟編輯 */
function openEditModal(category) {
    editForm.value = {
        id: category.categoryId,
        name: category.name,
        description: category.description
    }

    axios.get(`/api/support/check/category/${category.categoryId}`)
        .then(function (res) {
            canDelete.value = !res.data.inUse
        })

    errorsEdit.value = { name: "", description: "" }
    showModal.value = true
}

/* ✦ 關閉 modal → 清空錯誤 */
function closeModal() {
    showModal.value = false
    errorsEdit.value = { name: "", description: "" }
}

/* ✦ 更新分類（含紅字檢查） */
async function updateCategory() {
    errorsEdit.value.name = ""
    errorsEdit.value.description = ""

    if (!editForm.value.name) {
        errorsEdit.value.name = "請輸入分類名稱"
    }
    if (!editForm.value.description) {
        errorsEdit.value.description = "請輸入分類說明"
    }

    if (errorsEdit.value.name || errorsEdit.value.description) return

    await axios.put(`/api/support/category/${editForm.value.id}`, {
        name: editForm.value.name,
        description: editForm.value.description
    }, {
        headers: {
            "userId": adminUserId
        }
    })

    showToast("更新成功！")
    showModal.value = false
    loadCategories()
}

/* ✦ 刪除分類 */
async function confirmDelete() {
    const id = editForm.value.id
    await axios.delete(`/api/support/category/${editForm.value.id}`, {
        headers: {
            "userId": adminUserId
        }
    })

    showDeleteConfirm.value = false
    showModal.value = false

    showToast("刪除成功！")
    loadCategories()
}

onMounted(loadCategories)
</script>

<style scoped>
.scroll-area {
    max-height: 800px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 10px;
    /* 讓捲軸不擠文字 */
}


textarea {
    height: 120px;
    resize: none;
}

/* hover */
.category-item {
    padding: 6px 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.category-item:hover {
    background-color: #e8ecef;
}

/* modal */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-container,
.confirm-container {
    background: white;
    padding: 20px;
    width: 320px;
    max-width: 90%;
    position: relative;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.modal-close {
    position: absolute;
    top: 8px;
    right: 18px;
    font-size: 24px;
    font-weight: 700;
    color: #444;
    cursor: pointer;
    transition: 0.2s ease;
}

.modal-close:hover {
    color: #000;
    transform: scale(1.15);
}

@media (max-width: 768px) {
    .d-flex {
        flex-direction: column;
        /* 左右 → 上下 */
    }

    .d-flex>div:first-child {
        width: 100% !important;
        /* 左側區塊改滿版 */
        margin-bottom: 20px;
        /* 與下方留間距 */
    }

    .category-panel {
        margin-left: 0 !important;
        /* 移除原本的 ms-5 */
    }
}
</style>
