<template>
    <div>
        <!-- 每頁顯示筆數 -->
        <div class="history-header">
            <h4 class="fw-bold m-0">過往客服紀錄</h4>

            <div class="page-size-select">
                <label class="me-2 text-muted small">每頁顯示：</label>
                <select v-model="pageSize" class="form-select form-select-sm" style="width: 80px;">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                </select>
            </div>
        </div>

        <!-- 列表內容 -->
        <div v-for="item in paginatedData" :key="item.id" class="history-item">
            <div class="item-header" @click="$emit('openDetail', item)">
                <div class="d-flex align-items-center gap-2">
                    <span :class="['status-badge', statusClass(item.status)]">
                        {{ statusText(item.status) }}
                    </span>
                    <div class="fw-bold">{{ item.title }}</div>
                </div>
                <div class="small text-muted">{{ item.createdTime }}</div>
            </div>
        </div>

        <!-- 分頁 pagination -->
        <nav class="mt-3">
            <ul class="pagination justify-content-center">

                <!-- 上一頁 -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="goPrev">上一頁</button>
                </li>

                <!-- 頁碼 -->
                <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>

                <!-- 下一頁 -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="goNext">下一頁</button>
                </li>

            </ul>
        </nav>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    records: Array,
});


const statusText = (s) =>
    s === 0 ? "尚未回覆" : s === 1 ? "處理中" : "已結案";

const statusClass = (s) =>
    s === 0 ? "pending"
        : s === 1 ? "processing"
            : "closed";

// 分頁狀態
const currentPage = ref(1);
const pageSize = ref(10); // 預設顯示 7 筆

// 監聽父元件 records 變動 → 自動回到第一頁
watch(
    () => props.records,
    () => {
        currentPage.value = 1;
    }
);

// 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(props.records.length / pageSize.value) || 1;
});

// 分頁後的資料
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return props.records.slice(start, start + pageSize.value);
});

// 上一頁 / 下一頁
const goPrev = () => {
    if (currentPage.value > 1) currentPage.value--;
};

const goNext = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};
</script>

<style scoped>
.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.page-size-select {
    display: flex;
    align-items: center;
}

.history-item {
    padding: 16px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}

.item-header:hover {
    color: #2b5f75;
}

.alink {
    color: #1a9474;
}

.alink:hover {
    color: #0d4838;
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
    /* 深灰：已結案 */
}

.page-item .page-link {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 1px solid #ddd !important;
}

/* Hover 時：文字不變，背景微灰 */
.page-item .page-link:hover {
    background-color: #f2f2f2 !important;
    color: #000000 !important;
}

/* Active 頁碼：黑底白字（或你要黑字白底？選一種）*/
.page-item.active .page-link {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-color: #000000 !important;
}
</style>
