<template>

    <!-- 主內容 -->


    <h2 class="page-title">結案代碼維護</h2>

    <div class="d-flex">

        <!-- 左：新增 Reason -->
        <div style="width: 350px;">
            <h5 class="fw-bold mb-2">新增結案代碼：</h5>

            <div class="card p-4">

                <!-- 代碼 -->
                <div class="mb-3">
                    <label class="form-label">代碼</label>
                    <input v-model="form.code" class="form-control" placeholder="例：A1" />
                    <small v-if="errors.code" class="text-danger">{{ errors.code }}</small>
                </div>

                <!-- 代碼名稱 -->
                <div class="mb-3">
                    <label class="form-label">代碼名稱</label>
                    <input v-model="form.description" class="form-control" placeholder="例：資訊異常修正" />
                    <small v-if="errors.description" class="text-danger">{{ errors.description }}</small>
                </div>

                <!-- 代碼說明（非必填） -->
                <div class="mb-3">
                    <label class="form-label">代碼類型說明</label>
                    <textarea v-model="form.note" class="form-control"
                        placeholder="例：訂單資訊錯誤，需人工修正（日期、姓名、房型）"></textarea>
                </div>

                <div class="mb-3" style="font-size: 11px;">
                    <p><strong>A — 資料修正（Adjustment）</strong><br>
                        後台資料更新、資訊補充、帳號／系統處理相關需求</p>
                    <p><strong>C — 結案紀錄（Close）</strong><br>
                        案件已處理完成、結案，但不涉及退款</p>
                    <p><strong>R — 退款處置（Refund）</strong><br>
                        涉及金流或退款相關的結案行為</p>
                </div>

                <button class="btn btn-outline-dark w-100" @click="createReason">新增</button>
            </div>
        </div>

        <!-- 右：Reason 列表 -->
        <div class="flex-grow-1 ms-5 category-panel">

            <h5 class="fw-bold mb-2">所有結案代碼：</h5>

            <div class="card p-4 scroll-area">
                <div v-for="r in reasons" :key="r.id" class="mb-3 category-item" @click="openEditModal(r)">
                    <div class="fw-bold category-title">{{ r.code }} — {{ r.description }}</div>
                    <div class="text-muted small">{{ r.note || '—' }}</div>
                </div>
            </div>

        </div>

    </div>


    <!-- 編輯 Modal -->
    <div v-if="showModal" class="modal-mask" @click.self="closeModal">
        <div class="modal-container">

            <span class="modal-close" @click="closeModal">×</span>

            <h5 class="fw-bold mb-3">編輯結案原因</h5>

            <!-- 代碼 -->
            <div class="mb-3">
                <label class="form-label">代碼</label>
                <input v-model="editForm.code" class="form-control" />
                <small v-if="errorsEdit.code" class="text-danger">{{ errorsEdit.code }}</small>
            </div>

            <!-- 代碼名稱（description） -->
            <div class="mb-3">
                <label class="form-label">代碼名稱</label>
                <textarea v-model="editForm.description" class="form-control"></textarea>
                <small v-if="errorsEdit.description" class="text-danger">{{ errorsEdit.description }}</small>
            </div>

            <!-- 代碼說明（note） -->
            <div class="mb-3">
                <label class="form-label">代碼說明</label>
                <textarea v-model="editForm.note" class="form-control"></textarea>
            </div>

            <!-- 按鈕列 -->
            <div class="d-flex justify-content-between align-items-center mt-3">
                <button class="btn btn-sm btn-outline-danger-custom" :disabled="!canDelete"
                    @click="canDelete ? showDeleteConfirm = true : showToast('此代碼已有案件使用，無法刪除')">
                    刪除
                </button>

                <button class="btn btn-outline-dark btn-sm d-flex align-items-center" @click="updateReason">
                    更新
                </button>
            </div>
        </div>
    </div>

    <!-- 刪除確認視窗 -->
    <div v-if="showDeleteConfirm" class="modal-mask" @click.self="showDeleteConfirm = false">
        <div class="confirm-container">
            <span class="modal-close" @click="showDeleteConfirm = false">×</span>

            <h6 class="fw-bold mb-4 text-center">確定刪除此結案代碼嗎？</h6>

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



const errors = ref({
    code: "",
    description: "",
    note: ""
});



/* 所有 reason */
const reasons = ref([])

/* 新增輸入 */
const form = ref({
    code: '',
    description: '',
    note: '',
})

/* 編輯 modal */
const showModal = ref(false)
const editForm = ref({
    id: null,
    code: '',
    description: '',
    note: ''
})

/* 刪除確認 */
const showDeleteConfirm = ref(false)

/* Toast */
const toastMessage = ref("")
const showToastFlag = ref(false)
function showToast(msg) {
    toastMessage.value = msg
    showToastFlag.value = true
    setTimeout(() => showToastFlag.value = false, 2000)
}

/* 載入資料 */
const loadReasons = async () => {
    const res = await axios.get('/api/reasons')
    reasons.value = res.data
}

/* 新增 */
const createReason = async () => {
    errors.value.code = "";
    errors.value.description = "";
    errors.value.note = "";

    if (!form.value.code) {
        errors.value.code = "請輸入代碼";
    }
    if (!form.value.description) {
        errors.value.description = "請輸入代碼名稱";
    }

    // 有錯誤 → 不呼叫 API
    if (errors.value.code || errors.value.description) return;

    await axios.post("/api/reasons", {
        code: form.value.code,
        description: form.value.description,
        note: form.value.note
    }, {
        headers: {
            "userId": adminUserId   // ✔ 後端要用的 userId
        }
    })

    showToast("新增成功！");
    form.value = { code: "", description: "", note: "" };
    loadReasons();
};

/*驗證刪除*/
const canDelete = ref(true)

/* 開啟編輯 */
const openEditModal = (r) => {
    editForm.value = {
        id: r.id,
        code: r.code,
        description: r.description,
        note: r.note
    }

    canDelete.value = true


    axios.get(`/api/reasons/check/${r.id}`)
        .then(res => {
            canDelete.value = !res.data.inUse
        })

    showModal.value = true
}

function closeModal() {
    showModal.value = false;

    // 清空編輯的錯誤訊息
    errorsEdit.value = {
        code: "",
        description: "",
        note: ""
    };

    errors.value = {
        code: "",
        description: "",
        note: ""
    };

}


const errorsEdit = ref({
    code: "",
    description: "",
    note: ""
});




/* 更新 */
const updateReason = async () => {
    errorsEdit.value.code = "";
    errorsEdit.value.description = "";
    errorsEdit.value.note = "";

    if (!editForm.value.code) {
        errorsEdit.value.code = "請輸入代碼";
    }
    if (!editForm.value.description) {
        errorsEdit.value.description = "請輸入說明";
    }

    if (errorsEdit.value.code || errorsEdit.value.description) return;

    await axios.put(`/api/reasons/${editForm.value.id}`, {
        code: editForm.value.code,
        description: editForm.value.description,
        note: editForm.value.note
    }, {
        headers: {
            "userId": adminUserId
        }
    })

    showToast("更新成功！");
    showModal.value = false;
    loadReasons();
};


/* 刪除 */
const confirmDelete = async () => {
    await axios.delete(`/api/reasons/${editForm.value.id}`, {
        headers: {
            "userId": adminUserId
        }
    })

    showToast('刪除成功！')
    showDeleteConfirm.value = false
    showModal.value = false

    loadReasons()
}

onMounted(loadReasons)
</script>

<style scoped>
/* ========================== */
/* 類別列表 hover              */
/* ========================== */
.category-item {
    padding: 6px 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.category-item:hover {
    background-color: #e8ecef;
}

.category-title {
    font-size: 15px;
    color: #1d1d1d;
}

/* ========================== */
/* Modal 遮罩                 */
/* ========================== */
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

/* ========================== */
/* Modal 容器                 */
/* ========================== */
.modal-container,
.confirm-container {
    background: white;
    padding: 20px;
    width: 380px;
    max-width: 90%;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.confirm-container {
    width: 320px;
    position: relative;
}

.modal-container {
    position: relative;
}

/* X 按鈕 */
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

textarea {
    height: 120px;
    resize: none;
}

/* 右側結案代碼列表—加入捲軸 */
.scroll-area {
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
}

/* 美化捲軸（可加可不加） */
.scroll-area::-webkit-scrollbar {
    width: 8px;
}

.scroll-area::-webkit-scrollbar-thumb {
    background: #d1d5db;
}

.scroll-area::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
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
