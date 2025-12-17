<template>
    <!-- MAIN -->

    <h2 class="page-title">案件紀錄匯出</h2>

    <!-- 搜尋條件 -->
    <div class="card p-4 mb-4">
        <form class="row g-3 align-items-end">

            <!-- 用戶 ID -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">用戶 ID</label>
                <input v-model="filters.userId" type="text" class="form-control" placeholder="User Id" />
            </div>

            <!-- 用戶名稱 -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">用戶名稱</label>
                <input v-model="filters.username" type="text" class="form-control" placeholder="User Name" />
            </div>

            <!-- 案件編號 -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">案件編號</label>
                <input v-model="filters.caseCode" type="text" class="form-control" placeholder="例：SUP-2025-00001" />
            </div>

            <!-- 狀態 -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">案件狀態</label>
                <select v-model="filters.status" class="form-select">
                    <option value="">全部</option>
                    <option value="0">未處理</option>
                    <option value="1">處理中</option>
                    <option value="2">已結案</option>
                </select>
            </div>

            <!-- 分類 -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">分類</label>
                <select v-model="filters.categoryId" class="form-select">
                    <option value="">全部</option>
                    <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
                        {{ c.name }}
                    </option>
                </select>
            </div>

            <!-- 結案代碼 -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">結案代碼</label>
                <select v-model="filters.reasonId" class="form-select">
                    <option value="">全部</option>
                    <option value=disabled>-----------</option>
                    <option value="R">R 類 - 退款處置(All)</option>
                    <option value="C">C 類 - 結案紀錄(All)</option>
                    <option value="A">A 類 - 資料修正(All)</option>
                    <option value=disabled>-----------</option>
                    <option v-for="r in reasons" :key="r.id" :value="r.id">
                        {{ r.code }} — {{ r.description }}
                    </option>
                </select>
            </div>

            <!-- 結案人員 ID -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">結案人員 ID</label>
                <input v-model="filters.closedById" type="text" class="form-control" placeholder="例：1" />
            </div>

            <!-- 結案人員姓名 -->
            <div class="col-md-3">
                <label class="form-label fw-semibold">結案人員姓名</label>
                <input v-model="filters.closedByName" type="text" class="form-control" placeholder="例：admin" />
            </div>

            <!-- 起始時間 + 結束時間（同一列） -->
            <div class="col-12 mt-2">
                <label class="form-label fw-semibold">案件建立時間</label>
                <div class="row g-3">
                    <div class="col-md-6">
                        <input v-model="filters.startDate" type="date" class="form-control" />
                    </div>
                    <div class="col-md-6">
                        <input v-model="filters.endDate" type="date" class="form-control" />
                    </div>
                </div>
            </div>

            <!-- ◆ 第三排：結案時間 -->
            <div class="col-12 mt-2">
                <label class="form-label fw-semibold">案件結案時間</label>
                <div class="row g-3">
                    <div class="col-md-6">
                        <input v-model="filters.closeStart" type="date" class="form-control" />
                    </div>
                    <div class="col-md-6">
                        <input v-model="filters.closeEnd" type="date" class="form-control" />
                    </div>
                </div>
            </div>

            <!-- 按鈕列 -->
            <div class="col-12 text-end mt-2">
                <button type="button" class="btn btn-outline-dark me-2" @click="resetFilters">清空條件</button>
                <button type="button" class="btn btn-primary" @click="searchData">搜尋</button>
            </div>
        </form>
    </div>




    <!-- 查詢結果 -->
    <div class="card p-4 result-scroll-area" v-if="results.length > 0">
        <div class="d-flex justify-content-between mb-3">
            <h5 class="fw-bold">符合條件的案件（{{ results.length }} 筆）</h5>
            <button class="btn btn-dark" @click="exportExcel">匯出 Excel</button>
        </div>

        <div class="table-responsive">
            <table class="table table-striped align-middle">
                <thead class="table-dark">
                    <tr class="text-center">
                        <th>用戶 ID</th>
                        <th>用戶名稱</th>
                        <th>案件編號</th>
                        <th>案件狀態</th>
                        <th>分類</th>
                        <th>結案代碼</th>
                        <th>結案人員 ID</th>
                        <th>結案人員姓名</th>
                        <th>案件建立時間</th>
                        <th>案件結案時間</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="r in results" :key="r.supportId">

                        <td class="text-center">{{ r.user?.id }}</td>
                        <td class="text-center">{{ r.user?.firstName }}</td>
                        <td class="text-center">{{ r.caseCode }}</td>

                        <td class="text-center">
                            <span v-if="r.status === 0">未處理</span>
                            <span v-if="r.status === 1">處理中</span>
                            <span v-if="r.status === 2">已結案</span>
                        </td>

                        <td class="text-center">{{ r.sCategory?.name }}</td>

                        <td class="text-center">
                            {{ r.reason ? r.reason.code : '—' }}
                        </td>

                        <td class="text-center">{{ r.updatedBy?.id || '—' }}</td>
                        <td class="text-center">{{ r.updatedBy?.firstName || '—' }}</td>

                        <td class="text-center">{{ formatDate(r.createdTime) }}</td>
                        <td class="text-center">{{ r.updatedTime ? formatDate(r.updatedTime) : '—' }}</td>

                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- 無資料 -->
    <div v-else class="text-muted text-center mt-4">
        尚未查詢或查無資料。
    </div>



    <!-- TOAST -->
    <div v-if="showToastFlag" class="toast-success position-fixed" style="bottom:20px; right:20px; z-index:9999;">
        {{ toastMessage }}
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/admin/api/axios'

/* 搜尋條件 */
const filters = ref({
    userId: "",
    username: "",
    caseCode: "",
    status: "",
    categoryId: "",
    reasonId: "",
    closedById: "",
    closedByName: "",
    startDate: "",  // 案件建立開始
    endDate: "",    // 案件建立結束
    closeStart: "", // 案件結案開始 ← 新增
    closeEnd: ""    // 案件結案結束 ← 新增
})

/* API 資料 */
const categories = ref([])
const reasons = ref([])
const results = ref([])

/* Toast */
const toastMessage = ref("")
const showToastFlag = ref(false)
function showToast(msg) {
    toastMessage.value = msg
    showToastFlag.value = true
    setTimeout(() => showToastFlag.value = false, 2000)
}

/* 查詢 */
async function searchData() {
    const res = await axios.post('/api/report/support/search', filters.value)
    results.value = res.data
    showToast("查詢成功！")
}

/* 匯出 Excel */
async function exportExcel() {
    const response = await axios.post('/api/report/support/export', filters.value, {
        responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: "application/vnd.ms-excel" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "Support_Report.xlsx"
    link.click()
}

/* 初始化 */
onMounted(async () => {
    categories.value = (await axios.get('/api/support/category')).data
    reasons.value = (await axios.get('/api/reasons')).data
})

/* 時間格式化 */
function formatDate(dateString) {
    if (!dateString) return "—"
    return new Date(dateString.replace(" ", "T")).toLocaleString('zh-TW', { hour12: false })
}

/* 重置 */
function resetFilters() {
    filters.value = {
        userId: "",
        username: "",
        caseCode: "",
        status: "",
        categoryId: "",
        reasonId: "",
        closedById: "",
        closedByName: "",
        startDate: "",
        endDate: "",
        closeStart: "",
        closeEnd: ""
    }
    results.value = []
}
</script>
<style scoped>
.result-scroll-area {
    max-height: 70vh;
    /* 建議用 70vh，剛好在畫面上很舒服 */
    overflow-y: auto;
    /* 只開啟垂直捲軸 */
    overflow-x: auto;
    /* 允許表格橫向滾動，避免被切到 */
}

.table-fixed {
    table-layout: fixed;
    width: 100%;
}

.table-fixed th,
.table-fixed td {
    word-wrap: break-word;
}
</style>