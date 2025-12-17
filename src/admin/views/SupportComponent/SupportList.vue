<template>
    <h4 class="page-title">客服案件紀錄</h4>
    <!-- 統計卡片 -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card text-center p-3 border-warning" @click="applyStatusFilter(0)" style="cursor:pointer;">
                <div class="fs-4 text-count1 mb-2">未處理</div>
                <div class="fs-3 fw-bold">{{ unRepliedCount }} 件</div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card text-center p-3 border-primary" @click="applyStatusFilter(1)" style="cursor:pointer;">
                <div class="fs-4 text-count2 mb-2">處理中</div>
                <div class="fs-3 fw-bold">{{ processingCount }} 件</div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card text-center p-3 border-danger" @click="applyStatusFilter(2)" style="cursor:pointer;">
                <div class="fs-4 text-count3 mb-2">已結案</div>
                <div class="fs-3 fw-bold">{{ closedCount }} 件</div>
            </div>
        </div>
    </div>


    <!-- 進階搜尋 -->
    <div class="card p-4 mb-4 shadow-sm border-0">
        <form class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label fw-semibold">用戶名稱</label>
                <input v-model="filters.username" type="text" class="form-control" placeholder="Value" />
            </div>

            <div class="col-md-2">
                <label class="form-label fw-semibold">用戶 ID</label>
                <input v-model="filters.userId" type="text" class="form-control" placeholder="Value" />
            </div>

            <div class="col-md-3">
                <label class="form-label fw-semibold">案件編號</label>
                <input v-model="filters.caseCode" type="text" class="form-control" placeholder="Value" />
            </div>

            <div class="col-md-2">
                <label class="form-label fw-semibold">狀態</label>
                <select v-model="filters.status" class="form-select">
                    <option value="">全部</option>
                    <option value="0">未處理</option>
                    <option value="1">處理中</option>
                    <option value="2">已結案</option>
                </select>
            </div>

            <div class="col-md-2">
                <label class="form-label fw-semibold">分類</label>
                <select v-model="filters.category" class="form-select">
                    <option value="">全部</option>
                    <option v-for="cat in sCategories" :key="cat.categoryId" :value="cat.categoryId">
                        {{ cat.name }}
                    </option>
                </select>
            </div>

            <div class="col-md-6">
                <label class="form-label fw-semibold">主旨 / 內容搜尋</label>
                <input v-model="filters.keyword" type="text" class="form-control" placeholder="Value" />
            </div>

            <div class="col-12 text-end">
                <button type="button" class="btn btn-outline-dark me-2" @click="resetFilters">重置條件</button>
                <button type="button" class="btn btn-primary" @click="applyFilters">搜尋</button>
            </div>
        </form>
    </div>


    <div class="d-flex justify-content-end mb-2">
        <div class="input-group input-group-sm" style="width: 140px;">
            <label class="input-group-text">每頁</label>
            <select class="form-select" v-model.number="pageSize">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
            </select>
        </div>
    </div>

    <!-- 案件列表 -->
    <div class="table-responsive">
        <table class="table align-middle">
            <thead>
                <tr class="text-center">
                    <th>用戶</th>
                    <th>用戶ID</th>
                    <th>案件編號</th>
                    <th>分類</th>
                    <th>主旨</th>
                    <th>建立時間</th>
                    <th>狀態</th>
                    <th>操作</th>
                    <th>結案代碼</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="item in paginatedSupports" :key="item.supportId">

                    <!-- 第一列：原本的案件資料 -->
                    <tr>
                        <td><i class="bi bi-person"></i> {{ item.user?.firstName || '—' }}</td>
                        <td class="text-center">{{ item.user?.id || '—' }}</td>

                        <!-- 點擊展開 -->
                        <td class="case-link" @click="toggleCase(item.supportId)"
                            style="cursor: pointer; color: #2b5f75; font-weight: 600;">
                            {{ item.caseCode }}
                        </td>

                        <td class="text-center"><span class="badge bg-category">{{ item.sCategory?.name || '—' }}</span>
                        </td>
                        <td>{{ item.title }}</td>
                        <td>{{ formatDate(item.createdTime) }}</td>

                        <td class="text-center">
                            <span v-if="item.status === 0" class="badge bg-undone text-dark">未處理</span>
                            <span v-else-if="item.status === 1" class="badge bg-handling">處理中</span>
                            <span v-else class="badge bg-complete">已結案</span>
                        </td>

                        <td class="text-center">
                            <div class="case-btn-group">
                                <button class="btn btn-sm btn-outline-dark" @click="goToDetail(item.supportId)">
                                    詳細
                                </button>

                                <button class="btn btn-sm btn-outline-danger" :disabled="item.status === 2"
                                    @click="openCloseModal(item.supportId)">
                                    結案
                                </button>
                            </div>
                        </td>
                        <td>
                            {{ item.reason ? item.reason.code + " — " + item.reason.description : "—" }}
                        </td>
                    </tr>

                    <!-- 第二列：展開區塊（放在 v-for 裡的下一列） -->
                    <tr v-if="openCaseId === item.supportId" class="bg-light">
                        <td colspan="9">
                            <div class="p-3">
                                <p><strong></strong>{{ item.content }}</p>
                                <div v-if="item.photos && item.photos.length > 0">
                                    <strong>附圖：</strong>
                                    <div class="d-flex flex-wrap gap-2 mt-2">
                                        <img v-for="p in item.photos" :key="p.photoId" :src="getPhotoUrl(p.url)"
                                            @click="openImage(getPhotoUrl(p.url))"
                                            style="width:100px;height:100px;object-fit:cover;border-radius:6px;cursor:pointer;">
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <div v-if="lightboxImage" class="lightbox" @click="lightboxImage = null">
                        <img :src="lightboxImage" class="lightbox-img" />
                    </div>
                </template>
                <!-- 無資料時 -->
                <tr v-if="paginatedSupports.length === 0">
                    <td colspan="8" class="text-center text-muted py-4">尚無符合條件的案件</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Pagination 分頁 -->
    <nav class="mt-3">
        <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" @click="prevPage">上一頁</a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <a class="page-link" @click="goToPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" @click="nextPage">下一頁</a>
            </li>
        </ul>
    </nav>
    <p class="text-center text-muted small mt-2">
        顯示第 {{ (currentPage - 1) * pageSize + 1 }} -
        {{ Math.min(currentPage * pageSize, filteredSupports.length) }} 筆，
        共 {{ filteredSupports.length }} 筆
    </p>


    <!-- 結案彈窗 -->
    <div v-if="showCloseModal" class="modal-mask" @click.self="closeCloseModal">
        <div class="modal-container">

            <span class="modal-close" @click="closeCloseModal">×</span>

            <h5 class="fw-bold mb-3">案件結案</h5>

            <!-- 結案碼 -->
            <div class="mb-3">
                <label class="form-label">結案代碼</label>
                <select v-model="closeForm.reasonId" class="form-control">
                    <option disabled value="">請選擇結案代碼</option>
                    <option v-for="reason in reasons" :key="reason.id" :value="reason.id">
                        {{ reason.code }} — {{ reason.description }}
                    </option>
                </select>
                <!-- 錯誤訊息：未選理由碼 -->
                <div v-if="reasonError" class="text-danger small mt-1">
                    {{ reasonError }}
                </div>
            </div>

            <!-- 備註 -->
            <div class="mb-3">
                <label class="form-label">備註</label>
                <textarea v-model="closeForm.remark" class="form-control" rows="3"></textarea>
            </div>

            <!-- 按鈕列 -->
            <div class="d-flex justify-content-end mt-3">

                <button class="btn btn-sm btn-outline-danger-custom" @click="submitCloseCase">確定結案</button>
            </div>

        </div>
    </div>
    <!-- 吐司 -->
    <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom: 20px; right: 20px; z-index: 9999;">
        {{ toastMessage }}
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/admin/api/axios'
import { useRouter } from 'vue-router'

import useUserStore from "@/user/stores/user.js"
const userStore = useUserStore();

const rawUser = JSON.parse(sessionStorage.getItem("hoUser"))
const adminUserId = rawUser?.userId

const router = useRouter()
const supports = ref([])
const sCategories = ref([])

const openCaseId = ref(null)

function toggleCase(id) {
    openCaseId.value = openCaseId.value === id ? null : id
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

// 統計數據
const unRepliedCount = computed(() => supports.value.filter(s => s.status === 0).length)
const processingCount = computed(() => supports.value.filter(s => s.status === 1).length)
const closedCount = computed(() => supports.value.filter(s => s.status === 2).length)


const statusFilter = ref(null);   // null = 全部


function applyStatusFilter(status) {
    if (statusFilter.value === status) {
        statusFilter.value = null;
    } else {
        statusFilter.value = status;
    }
    currentPage.value = 1;
}



//案件照片縮圖
const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL
function getPhotoUrl(url) {
    return FILE_BASE + url
}

//顯示照片縮圖
const lightboxImage = ref(null)

function openImage(url) {
    lightboxImage.value = url
}



// 分開「輸入中」與「套用中」的條件
const filters = ref({
    username: '',
    userId: '',
    caseCode: '',
    category: '',
    status: '',
    startDate: '',
    endDate: '',
    keyword: ''
})

const appliedFilters = ref({ ...filters.value }) // 實際生效的條件

// 取得客服案件資料
function fetchSupports() {
    axios.get('/api/support')
        .then(res => supports.value = res.data)
        .catch(err => console.error('無法取得客服資料', err))
}

// 取得案件分類
function fetchCategories() {
    axios.get('/api/support/category')
        .then(res => {
            sCategories.value = res.data
            console.log('取得分類資料', sCategories.value)
        })
        .catch(err => console.error('無法取得分類資料', err))
}

// 套用條件
function applyFilters() {
    appliedFilters.value = { ...filters.value }
    currentPage.value = 1
}

// 重置條件
function resetFilters() {
    filters.value = {
        username: '',
        userId: '',
        caseCode: '',
        category: '',
        status: '',
        startDate: '',
        endDate: '',
        keyword: ''
    }
    appliedFilters.value = { ...filters.value }
    currentPage.value = 1
}


// 根據 appliedFilters 篩選資料
const filteredSupports = computed(() => {
    let data = supports.value;

    // 1️⃣ 狀態卡片的篩選（未處理 / 處理中 / 已結案）
    if (statusFilter.value !== null) {
        data = data.filter(item => item.status === statusFilter.value);
    }

    // 2️⃣ 搜尋、分類、日期、關鍵字 … 套用 appliedFilters
    const f = appliedFilters.value;

    return data.filter(item => {
        const matchUsername = !f.username || item.user?.firstName?.includes(f.username);
        const matchUserId = !f.userId || String(item.user?.id) === String(f.userId);
        const matchCaseCode = !f.caseCode || item.caseCode.includes(f.caseCode);
        const matchStatus = !f.status || String(item.status) === String(f.status);
        const matchCategory = !f.category || item.sCategory?.categoryId === f.category;
        const matchKeyword =
            !f.keyword ||
            item.title.includes(f.keyword) ||
            item.content?.includes(f.keyword);

        const created = new Date(item.createdTime);
        const start = f.startDate ? new Date(f.startDate) : null;

        let end = null;
        if (f.endDate) {
            end = new Date(f.endDate);
            end.setDate(end.getDate() + 1);
        }

        const matchDate =
            (!start || created >= start) &&
            (!end || created <= end);

        return (
            matchUsername &&
            matchUserId &&
            matchCaseCode &&
            matchStatus &&
            matchCategory &&
            matchKeyword &&
            matchDate
        );
    });
});


// 分頁
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = computed(() => Math.ceil(filteredSupports.value.length / pageSize.value))
const paginatedSupports = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredSupports.value.slice(start, start + pageSize.value)
})



function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
function nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
    if (currentPage.value > 1) currentPage.value--
}

function formatDate(dateString) {
    if (!dateString) return '—'
    const normalized = dateString.replace(' ', 'T')
    const date = new Date(normalized)
    return date.toLocaleString('zh-TW', { hour12: false })
}


function goToDetail(id) {
    router.push(`/admin/support/${id}`)
}


/*結案功能*/

const reasons = ref([]); // 所有 reason code

// 結案 Modal 開關
const showCloseModal = ref(false);

// 表單
const closeForm = ref({
    supportId: null,
    reasonId: "",
    remark: ""
});

// 載入 reason codes
const loadReasons = async () => {
    const res = await axios.get("/api/reasons");
    reasons.value = res.data;
};

// 開啟結案 modal
const openCloseModal = (supportId) => {
    console.log("openCloseModal 被呼叫，收到 supportId =", supportId);
    closeForm.value = {
        supportId,
        reasonId: "",
        remark: ""
    };
    showCloseModal.value = true;
};

const closeCloseModal = () => {
    showCloseModal.value = false;
    reasonError.value = "";
};

//結案錯誤
const reasonError = ref("");

// 送出結案
const submitCloseCase = async () => {
    const { supportId, reasonId, remark } = closeForm.value;

    if (!reasonId) {
        reasonError.value = "請選擇結案代碼";
        return;
    }
    reasonError.value = ""; // 清除錯誤訊息


    await axios.put(
        `/api/support/${supportId}/status`,
        {
            status: 2,
            reasonId,
            remark
        },
        {
            headers: {
                userId: adminUserId
            }
        }
    );

    showToast("案件已成功結案！");
    showCloseModal.value = false;
    fetchSupports(); // 重載列表
};


onMounted(() => {
    fetchSupports()
    fetchCategories()
    loadReasons()
})
</script>

<style scoped>
.text-count1 {
    color: rgb(227, 159, 11)
}

.text-count2 {
    color: #2ea06f
}

.text-count3 {
    color: rgb(248, 75, 6)
}


/* ===== 操作按鈕排列 ===== */
.case-btn-group {
    display: flex;
    justify-content: center;
    gap: 6px;
}

/* ===== 按鈕：與 ArticleList 相同邏輯 ===== */
.case-btn {
    width: 70px;
    padding: 6px 0 !important;
    font-size: 0.95rem;
    font-weight: 600;
    text-align: center;
    white-space: normal;
    line-height: 1.1;
}

/* Layout（必要，與全域不衝突） */
.layout-wrapper {
    display: flex;
    height: 100vh;
    overflow: visible;
}

table tbody {
    font-size: 14px;
    /* 想要大小自己改 */
}

/* 主旨欄不允許被壓縮到太窄 */
th.col-subject,
td.col-subject {
    min-width: 180px;
    /* 主旨最小寬度 */
    max-width: 260px;
    /* 可調整 */
    white-space: normal;
    /* 允許換行 */
    word-break: break-word;
    /* 必要時斷行 */
}

.table-responsive table {
    width: max-content;
    /* 讓 table 依照內容展開 */
    min-width: 100%;
    /* 不要比容器小 */
}

/* Sidebar 寬度（外觀與顏色交給全域處理） */
.sidebar {
    width: 250px;
    flex-shrink: 0;
}

/* 主內容排版（背景色與視覺交給全域處理） */
.main-content {
    flex-grow: 1;
    padding: 2rem 2.5rem;
    overflow-y: auto;
}

/* 分頁中的案件編號連結樣式（頁面專屬） */
.case-link {
    color: #6f82ac;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.case-link:hover {
    text-decoration: underline;
}

/*結案彈窗*/
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-container {
    background: #fff;
    width: 450px;
    padding: 25px 30px;
    border-radius: 10px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .2);
}

.modal-close {
    position: absolute;
    right: 20px;
    top: 18px;
    font-size: 22px;
    cursor: pointer;
    color: #555;
}

.modal-close:hover {
    color: #000;
}


.modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    gap: 10px;
}


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

.lightbox-img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
}

/* 讓表頭在 RWD 時可以正常換行 */

@media(width:780px) {


    .col-subject {
        width: 180px;
        min-width: 180px;
        max-width: 180px;
        white-space: normal;
        word-break: break-word;
    }

    td.col-subject {
        width: 180px;
        max-width: 180px;
        word-break: break-word;
    }
}
</style>