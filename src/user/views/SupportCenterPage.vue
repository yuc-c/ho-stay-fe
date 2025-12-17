<template>
    <div class="support-app">
        <div class="page-center">
            <div class="support-layout">
                <div class="page-center">
                    <div class="support-layout">

                        <!-- 左側：新的客服提問 -->
                        <div class="left-panel">
                            <SupportForm @submitted="reloadRecords" />
                        </div>

                        <!-- 中間：歷史客服紀錄 -->
                        <div class="middle-panel">
                            <SupportHistoryList :records="records" @openDetail="openDetail" />
                        </div>

                        <!-- 右側彈出視窗：客服詳細 -->
                        <SupportDetail :support="selectedSupport" :show="showDrawer" @close="showDrawer = false" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
console.log("supportAxios baseURL =", supportAxios.defaults.baseURL);
import { ref, onMounted } from "vue";
import SupportForm from "@/user/views/SupportCompo/SupportForm.vue";
import SupportHistoryList from "@/user/views/SupportCompo/SupportHistoryList.vue";
import SupportDetail from "@/user/views/SupportCompo/SupportDetail.vue";
import supportAxios from "@/user/plugin/supportAxios";

import useUserStore from "@/user/stores/user.js";
const userStore = useUserStore();

import { useRouter } from "vue-router";
const router = useRouter();

const records = ref([]);
const showDrawer = ref(false);
const selectedSupport = ref(null);

// 模擬 API（你這邊之後接 axios）
const loadHistory = async () => {
    try {
        const res = await supportAxios.get("/api/support/mine", {
            headers: {
                "userId": userStore.userId     // ★★★ 必須加入
            }
        });
        records.value = res.data;

    } catch (err) {
        console.error("取得客服紀錄失敗", err);
    }
};

const reloadRecords = () => loadHistory();

const openDetail = (item) => {
    console.log("openDetail 被觸發！ item=", item);  // ← 加這行
    selectedSupport.value = item;
    showDrawer.value = true;
};

onMounted(() => {
    // Step 1：如果是登入後的回跳，執行本頁
    loadHistory();

    // Step 2：確認是否有 redirectAfterLogin
    const redirect = localStorage.getItem("redirectAfterLogin");

    if (redirect) {
        // 用完就刪掉，避免之後每次都跳
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirect);
    }
});
</script>

<style>
.support-app .page-center {
    min-height: calc(100vh - 80px);
    display: flex;
    justify-content: center;
    /* 水平置中 */
    align-items: center;
    /* 垂直置中 */
    padding: 50px;
}

.support-app .support-layout {
    display: flex;
    gap: 30px;
}

/* 左右 panel 固定寬度 */
.support-app .left-panel {
    width: 550px;
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.support-app .middle-panel {
    width: 500px;
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}


/* RWD */

@media (max-width: 768px) {
    .support-app .page-center {
        padding: 5px !important;
    }

    .support-app .support-layout {
        flex-direction: column;
    }

    .support-app .left-panel,
    .support-app .middle-panel,
    .support-app .support-detail {
        width: 100% !important;

        border-radius: 0 !important;
    }
}

@media (max-width: 1080px) {
    .support-app .page-center {
        padding: 5px !important;
    }

    .support-app .support-layout {
        flex-direction: column;
    }

    .support-app .left-panel,
    .support-app .middle-panel,
    .support-app .support-detail {
        width: 100% !important;
        border-radius: 0 !important;
    }
}
</style>
