<template>
    <!-- 標題 -->
    <h2 class="article-page-title">
        文章管理
        <span v-if="isSortMode" class="badge bg-secondary ms-2">
            排序模式：{{ currentCategoryName || '—' }}
        </span>
    </h2>

    <!-- 上方功能列 -->
    <div class="d-flex justify-content-between mb-4 article-toolbar">
        <!-- 左側：分類 + 搜尋 -->
        <div class="d-flex gap-2  left-controls">
            <select v-model="selectedCategory" class="form-select uniform-height" style="width: 160px;">
                <option value="">全部分類</option>
                <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
                    {{ c.name }}
                </option>
            </select>

            <div class="input-group search-box">
                <input v-model="pendingKeyword" class="form-control uniform-height" placeholder="搜尋標題或分類" />
                <button class="btn btn-outline-secondary uniform-height" @click="applySearch">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </div>

        <!-- 右側：每頁 / 新增 -->
        <div class="d-flex gap-3 align-items-start right-controls">
            <div v-if="!isSortMode" class="input-group input-group-sm uniform-height" style="width: 140px;">
                <label class="input-group-text">每頁</label>
                <select class="form-select" v-model.number="pageSize">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                </select>
            </div>

            <button class="btn btn-sm btn-outline-dark " @click="goCreate">
                新增
            </button>
        </div>
    </div>

    <!-- 一般模式：全部文章列表（不可拖曳，有分頁） -->
    <div v-if="!isSortMode">
        <table class="table custom-table">
            <thead>
                <tr>
                    <th style="width: 20%;">分類</th>
                    <th style="width: 60%;">主旨</th>
                    <th style="width: 20%; text-align: center;">操作</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="item in displayedArticles" :key="item.id">
                    <tr>
                        <td>{{ item.categoryName }}</td>
                        <td @click="toggleRow(item.id)" style="cursor: pointer; color: #2b5f75; font-weight: 600;">
                            {{ item.title }}
                        </td>
                        <td>
                            <div class="d-flex gap-2 justify-content-center">
                                <button v-if="item.status === 1" class="btn btn-sm btn-draft"
                                    @click.stop="openDraftModal(item.id)">
                                    退回
                                </button>
                                <button v-else class="btn btn-sm btn-dark" @click.stop="publish(item.id)">
                                    發佈
                                </button>
                                <button class="btn btn-sm btn-outline-dark no-click-when-published"
                                    :class="{ 'disabled-style': item.status === 1 }"
                                    :title="item.status === 1 ? '已發佈文章不可編輯' : ''"
                                    @click.stop="item.status === 1 ? null : edit(item.id)">
                                    編輯
                                </button>
                                <button class="btn btn-sm btn-outline-danger-custom"
        :class="{ 'disabled-style': item.status === 1 }"
        :disabled="item.status === 1"
        :title="item.status === 1 ? '已發佈文章不可刪除' : ''"
        @click.stop="removeItem(item.id)">
    刪除
</button>
                            </div>
                        </td>
                    </tr>

                    <tr v-if="openArticleId === item.id">
                        <td colspan="3" class="p-3 bg-light border-top">
                            <p class="mb-2">
                                <strong>主旨：</strong> {{ item.title }}
                            </p>
                            <p class="mb-2">
                                <strong>分類：</strong> {{ item.categoryName }}
                            </p>
                            <p class="mb-0 d-flex">
                                <strong class="me-2">內容：</strong>
                                <span v-html="item.content"></span>
                            </p>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>

        <!-- 分頁 -->
        <div class="d-flex justify-content-center mt-4">
            <nav>
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="toPage(currentPage - 1)">
                        <span class="page-link">Previous</span>
                    </li>
                    <li class="page-item" v-for="page in totalPages" :key="page"
                        :class="{ active: currentPage === page }" @click="toPage(page)">
                        <span class="page-link">{{ page }}</span>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }"
                        @click="toPage(currentPage + 1)">
                        <span class="page-link">Next</span>
                    </li>
                </ul>
            </nav>
        </div>
    </div>

    <!--  排序模式：正確版本 -->
    <div v-else>
        <table class="table custom-table">
            <thead>
                <tr>
                    <th style="width: 5%;"></th>
                    <th style="width: 20%;">分類</th>
                    <th style="width: 55%;">主旨</th>
                    <th style="width: 20%; text-align: center;">操作</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(element, index) in categoryList" :key="element.id">
                    <!--  主要資料列（可拖曳） -->
                    <tr :data-id="element.id" class="draggable-row">
                        <td style="width: 5%;">
                            <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                        </td>
                        <td style="width: 20%;">{{ element.categoryName }}</td>
                        <td class="article-title" style="width: 55%; cursor: pointer; color: #2b5f75; font-weight: 600;"
                            @click="toggleRow(element.id)">
                            {{ element.title }}
                        </td>
                        <td style="width: 20%;">
                            <div class="d-flex gap-2 justify-content-center">
                                <button v-if="element.status === 1" class="btn btn-sm btn-draft"
                                    @click.stop="openDraftModal(element.id)">
                                    退回
                                </button>
                                <button v-else class="btn btn-sm btn-dark" @click.stop="publish(element.id)">
                                    發佈
                                </button>
                                <button class="btn btn-sm btn-outline-dark"
                                    :class="{ 'disabled-style': element.status === 1 }" :disabled="element.status === 1"
                                    @click.stop="edit(element.id)">
                                    編輯
                                </button>
                                <button class="btn btn-sm btn-outline-danger-custom"
        :class="{ 'disabled-style': element.status === 1 }"
        :disabled="element.status === 1"
        @click.stop="removeItem(element.id)">
    刪除
</button>
                            </div>
                        </td>
                    </tr>

                    <!-- 展開內容列（不參與拖曳） -->
                    <tr v-if="openArticleId === element.id" class="expanded-row">
                        <td colspan="4" class="p-3 bg-light border-top">
                            <p class="mb-2"><strong>主旨：</strong> {{ element.title }}</p>
                            <p class="mb-2"><strong>分類：</strong> {{ element.categoryName }}</p>
                            <p class="mb-0 d-flex">
                                <strong class="me-2">內容：</strong>
                                <span v-html="element.content"></span>
                            </p>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>


    <!-- Toast -->
    <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom: 20px; right: 20px; z-index: 9999;">
        {{ toastMessage }}
    </div>

    <!-- 退回草稿確認視窗 -->
    <div v-if="showDraftConfirm" class="modal-backdrop">
        <div class="modal-box">
            <p class="mb-3">確定要退回草稿嗎？</p>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-dark" @click="cancelDraft">取消</button>
                <button class="btn btn-sm btn-outline-danger-custom" @click="confirmDraft">確認</button>
            </div>
        </div>
    </div>

    <!-- 刪除確認視窗 -->
    <div v-if="showDeleteConfirm" class="modal-backdrop">
        <div class="modal-box">
            <p class="mb-3">確定要刪除此文章嗎？</p>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-dark" @click="showDeleteConfirm = false">
                    取消
                </button>
                <button class="btn btn-sm btn-outline-danger-custom" @click="confirmDelete">
                    刪除
                </button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "@/admin/api/axios";
import Sortable from "sortablejs";
import useUserStore from "@/user/stores/user.js"
const userStore = useUserStore();

const rawUser = JSON.parse(sessionStorage.getItem("hoUser"))
const adminUserId = rawUser?.userId

const router = useRouter();

/* ---------------------- 狀態 ---------------------- */
const articles = ref([]);
const categories = ref([]);
const selectedCategory = ref("");
const pendingKeyword = ref("");
const searchKeyword = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const openArticleId = ref(null);
const categoryList = ref([]);

/* Toast / Modal 狀態 */
const toastMessage = ref("");
const showToastFlag = ref(false);
const showDraftConfirm = ref(false);
const draftTargetId = ref(null);
const showDeleteConfirm = ref(false);
const deleteTargetId = ref(null);

/* Sortable 實例 */
let sortableInstance = null;

/* ---------------------- 模式判斷 ---------------------- */
const isSortMode = computed(() => !!selectedCategory.value);

const currentCategoryName = computed(() => {
    if (!selectedCategory.value) return "";
    const found = categories.value.find(
        c => String(c.categoryId) === String(selectedCategory.value)
    );
    return found ? found.name : "";
});

/* ---------------------- 資料載入 ---------------------- */
async function loadArticles() {
    try {
        const res = await axios.get("/api/questions");
        articles.value = res.data.map(q => ({
            id: q.questionId,
            title: q.title,
            content: q.content,
            status: q.status,
            categoryName: q.category?.name || "無分類",
            categoryId: q.category?.categoryId || null,
            sortOrder: q.sortOrder ?? 0
        }));
    } catch (err) {
        console.error("文章載入失敗:", err);
    }
}

async function fetchCategories() {
    try {
        const res = await axios.get("/api/questions/category");
        categories.value = res.data;
    } catch (err) {
        console.error("分類載入失敗", err);
    }
}

onMounted(async () => {
    await Promise.all([loadArticles(), fetchCategories()]);
});

/* ---------------------- 搜尋 + 篩選 ---------------------- */
function applySearch() {
    searchKeyword.value = pendingKeyword.value.trim();
    currentPage.value = 1;
}

const filteredArticles = computed(() => {
    let list = articles.value;

    if (selectedCategory.value) {
        list = list.filter(
            item => String(item.categoryId) === String(selectedCategory.value)
        );
    }

    if (searchKeyword.value) {
        const kw = searchKeyword.value;
        list = list.filter(
            item =>
                item.title.includes(kw) ||
                item.categoryName.includes(kw)
        );
    }

    if (isSortMode.value) {
        list = [...list].sort(
            (a, b) =>
                (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id
        );
    }

    return list;
});

/* 一般模式：分頁 */
const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredArticles.value.length / pageSize.value))
);

const displayedArticles = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredArticles.value.slice(start, start + pageSize.value);
});

function toPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

/* 排序模式：維護 categoryList + 初始化 Sortable */
watch(
    [filteredArticles, selectedCategory],
    async ([newList, cat]) => {
        if (!cat) {
            categoryList.value = [];
            if (sortableInstance) {
                sortableInstance.destroy();
                sortableInstance = null;
            }
            return;
        }

        categoryList.value = [...newList];

        // 等待 DOM 更新後初始化 Sortable
        await nextTick();
        initSortable();
    },
    { immediate: true }
);

/* 初始化 Sortable.js */
function initSortable() {
    if (sortableInstance) {
        sortableInstance.destroy();
    }

    const tbody = document.querySelector('.custom-table tbody');
    if (!tbody) return;

    sortableInstance = Sortable.create(tbody, {
        animation: 200,
        handle: '.drag-handle',
        draggable: '.draggable-row', // ✅ 只拖曳主要列
        onEnd: async (evt) => {
            // 重新排序 categoryList
            const movedItem = categoryList.value.splice(evt.oldIndex, 1)[0];
            categoryList.value.splice(evt.newIndex, 0, movedItem);

            // 儲存排序
            await saveSort();
        }
    });
}

/* ---------------------- 排序儲存 ---------------------- */
async function saveSort() {
    try {
        const payload = categoryList.value.map((a, index) => ({
            id: a.id,
            sortOrder: index + 1
        }));
        await axios.put("/api/questions/sort", payload, {
            headers: { "userId": adminUserId }
        });
        showToast("排序已更新！");
        await loadArticles();
    } catch (err) {
        console.error("排序儲存失敗：", err);
        showToast("排序儲存失敗");
    }
}

/* ---------------------- 展開列 ---------------------- */
function toggleRow(id) {
    openArticleId.value = openArticleId.value === id ? null : id;
}
watch(selectedCategory, () => {
    openArticleId.value = null;
});

/* ---------------------- 操作按鈕 ---------------------- */
function publish(id) {
    axios
        .put(`/api/questions/${id}/status`, null, {
            params: { status: 1 },
            headers: { "userId": adminUserId }
        })
        .then(loadArticles);
}

function edit(id) {
    router.push(`/admin/faq/articles/edit/${id}`);
}

function removeItem(id) {
    deleteTargetId.value = id;
    showDeleteConfirm.value = true;
}

async function confirmDelete() {
    try {
        await axios.delete(`/api/questions/${deleteTargetId.value}`, {
            headers: { "userId": adminUserId }
        });
        showDeleteConfirm.value = false;
        showToast("刪除成功！");
        await loadArticles();
    } catch (err) {
        console.error("刪除失敗：", err);
        showToast("刪除失敗！");
    }
}

function goCreate() {
    router.push("/admin/faq/articles/create");
}

/* ---------------------- Toast ---------------------- */
function showToast(message) {
    toastMessage.value = message;
    showToastFlag.value = true;
    setTimeout(() => (showToastFlag.value = false), 2000);
}

/* ---------------------- 退回草稿 ---------------------- */
function openDraftModal(id) {
    draftTargetId.value = id;
    showDraftConfirm.value = true;
}

function cancelDraft() {
    showDraftConfirm.value = false;
    draftTargetId.value = null;
}

function confirmDraft() {
    axios
        .put(`/api/questions/${draftTargetId.value}/status`, null, {
            params: { status: 0 },
            headers: { "userId": adminUserId }
        })
        .then(async () => {
            showDraftConfirm.value = false;
            showToast("已退回草稿！");
            await loadArticles();
        });
}
</script>

<style scoped>
.page-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

/* ===== 表格樣式 ===== */
.custom-table {
    width: 100%;
    background-color: white;
    margin-bottom: 0;
}

/* 表頭 - 使用全域變數 */
.custom-table thead {
    background-color: #D7D7D7 !important;
    /* 奶油灰，與全域一致 */
    color: #3F3F3F !important;
    font-weight: 600;
}

.custom-table thead th {
    padding: 12px;
    vertical-align: middle;
    border-color: var(--border-color, #E5E7EB) !important;
}

/* 表格列 */
.custom-table tbody tr {
    background: white;
    transition: 0.2s;
}

.custom-table tbody td {
    padding: 12px;
    vertical-align: middle;
}

/* hover - 使用全域變數 */
.custom-table tbody tr:hover {
    background-color: #F3F1EB !important;
    /* 淡米色，與全域一致 */
}

/* 展開區塊 */
.expanded-row {
    border-bottom: none !important;
}

.expanded-row td {
    background-color: #F6F3EB !important;
    /* 與全域 bg-cream 一致 */
}

/* ===== 排序模式 ===== */
.draggable-row {
    border-bottom: none !important;
}

.draggable-row:hover {
    background-color: #F3F1EB;
}

.draggable-row.sortable-ghost {
    opacity: 0.4;
    background-color: #E5E7EB;
}

.draggable-row.sortable-drag {
    opacity: 0.8;
}

/* 拖曳手柄 */
.drag-handle {
    font-size: 1.2rem;
    color: var(--text-muted, #6B7280);
    cursor: grab;
}

.drag-handle:hover {
    color: var(--text-dark, #2B2B2B);
}

.drag-handle:active {
    cursor: grabbing;
}

/* ===== 搜尋框 ===== */
.search-box input {
    border-right: none;
}

.search-box .input-group-text {
    border-left: none;
}

/* ===== 文章標題 hover ===== */
.article-title {
    color: var(--primary-green-dark, #6F8A72);
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.article-title:hover {
    text-decoration: underline;
    color: var(--primary-green, #89A48C);
}

/* ===== 統一高度 ===== */
.input-group.uniform-height,
.input-group.uniform-height .form-select,
.input-group.uniform-height .input-group-text {
    height: 38px !important;
    display: flex;
    align-items: center;
    font-size: 0.95rem;
}

.btn.uniform-height {
    height: 38px !important;
    font-size: 0.95rem;
    padding-top: 6px;
    padding-bottom: 6px;
}

/* ===== 版面配置 ===== */
.layout-wrapper {
    display: flex;
    height: 100vh;
}

.sidebar {
    width: 250px;
    flex-shrink: 0;
}

.main-content {
    flex-grow: 1;
    padding: 2rem 3rem;
    overflow-y: auto;
    min-height: 0;
    background-color: rgba(255, 255, 255, 0.6);
    /* 與全域一致 */
}

.page-title {
    font-weight: 700;
    color: var(--text-dark, #2B2B2B);
}

table tbody {
    font-size: 14px;
    /* 想要大小自己改 */
}

/* ===== 按鈕 - 使用全域變數 ===== */


/* 刪除（柔紅） */
.btn-outline-danger-custom {
    border-color: var(--accent-red, #D45C4A) !important;
    color: var(--accent-red, #D45C4A) !important;
}

.btn-outline-danger-custom:hover {
    background-color: var(--accent-red, #D45C4A) !important;
    color: white !important;
}

/* 排序模式退回草稿 */
.btn-draft {
    background-color: var(--primary-green, #89A48C) !important;
    border-color: var(--primary-green, #89A48C) !important;
    color: white !important;
}

.btn-draft:hover {
    background-color: var(--primary-green-dark, #6F8A72) !important;
    color: white !important;
    border-color: var(--primary-green-dark, #6F8A72) !important;
}

/* Disabled */
.no-click-when-published.disabled-style {
    opacity: 0.5;
    pointer-events: none;
}

.disabled-style {
    opacity: 0.5;
    pointer-events: none; /* 防止意外事件觸發（保險） */
}



/* ===== Modal ===== */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9998;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-box {
    background: white;
    padding: 20px 24px;
    border-radius: 0 !important;
    /* 與全域一致，無圓角 */
    width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* ===== Badge（如果有使用） ===== */
.badge {
    border-radius: 0 !important;
}


.article-page-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.8rem;
    color: var(--text-dark);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
    .layout-wrapper {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        height: auto;
    }

    .main-content {
        padding: 1rem;
    }

    .custom-table {
        font-size: 0.875rem;
    }

    .custom-table thead th,
    .custom-table tbody td {
        padding: 8px;
    }
}

/* 讓表頭在 RWD 時可以正常換行 */
@media (max-width: 992px) {
    .table th {
        white-space: normal !important;
        /* 允許換行 */
        word-break: break-word;
        /* 必要時讓長字斷行 */
        text-align: center;
    }
}

@media (max-width: 992px) {
    .table td {
        white-space: normal !important;
        word-break: break-all;
        text-align: center;
    }
}

@media (max-width: 768px) {

    .table th,
    .table td {
        font-size: 12px;
        padding: 6px;
    }
}

@media (max-width: 768px) {
    .article-toolbar {
        flex-direction: column;
        /* 左右 → 上下 */
        gap: 12px !important;
        align-items: stretch !important;
    }

    .article-toolbar .left-controls {
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .article-toolbar .right-controls {
        flex-direction: column;
        gap: 12px;
        width: 100%;
        align-items: flex-start !important;
    }

    .search-box {
        width: 100% !important;
        /* 搜尋匡占滿 */
    }


    .article-page-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.8rem;
        color: var(--text-dark);
        text-align: center;
    }
}
</style>