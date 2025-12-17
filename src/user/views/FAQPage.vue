<template>
    <div class="faq-wrapper">

        <!-- ====================== 頁面標題 ====================== -->
        <section class="faq-header text-center py-5">
            <h1 class="fw-bold">FAQ</h1>
            <p class="text-muted fs-5">客服中心</p>

            <div class="search-box d-flex justify-content-center mt-3">
                <input v-model="keyword" type="text" class="form-control search-input-faq" placeholder="您需要哪方面協助？" />
                <button class="btn btn-dark-2 ms-2" @click="search">Search</button>
            </div>
        </section>


        <!-- ====================== 類別檢索 ====================== -->
        <section class="container py-4">
            <h4 class="fw-bold">類別檢索</h4>
            <p class="text-muted">Category</p>

            <div class="row g-4 mt-2">
                <div v-for="cat in categories" :key="cat.categoryId" class="col-6 col-md-4 col-lg-3">
                    <div class="category-card border rounded p-4 text-center"
                        :class="{ highlight: highlightId === cat.categoryId }" @mousedown="highlightId = cat.categoryId"
                        @mouseup="highlightId = null" @mouseleave="highlightId = null" @click="selectCategory(cat)">
                        <h5 class="fw-bold mb-2">{{ cat.name }}</h5>
                        <p class="text-muted small">{{ cat.description }}</p>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="category-card border rounded p-4 text-center" @click="goSupport">
                        <h5 class="fw-bold mb-2 ">聯絡客服</h5>
                        <p class="text-muted small">直接提交客服問題</p>
                    </div>
                </div>
            </div>
        </section>
        <hr />

        <!-- ====================== 類別文章列表 ====================== -->
        <section v-if="selectedCategory" class="container py-5" id="faq-result">

            <h3 class="fw-bold text-center mb-4">
                {{ selectedCategory?.name || '' }}
            </h3>

            <!-- 若沒有文章時顯示提示 -->
            <p v-if="questions.length === 0" class="text-center text-muted">
                此分類目前沒有文章
            </p>

            <div class="accordion-list mx-auto" style="max-width: 900px;">
                <div v-for="q in questions" :key="q.questionId" class="faq-item mb-3">
                    <button class="faq-question w-100 text-start" @click="toggle(q.questionId)">
                        {{ q.title }}
                        <span class="float-end">
                            <i :class="openId === q.questionId ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </span>
                    </button>

                    <!-- 內容：只有 openId 等於這一題時才出現 -->
                    <div v-if="openId === q.questionId" class="faq-answer p-3">
                        <div class="text-muted m-0 faq-answer-html" v-html="q.content"></div>
                    </div>
                </div>
            </div>

        </section>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import supportAxios from "@/user/plugin/supportAxios";


const keyword = ref("");
const categories = ref([]);
const questions = ref([]);
const selectedCategory = ref(null);
const openId = ref(null);


//聯絡客服
import { useRouter } from "vue-router";
const router = useRouter();

const goSupport = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        localStorage.setItem("redirectAfterLogin", "/user/support");
        router.push("/user/login");
        return;
    }

    router.push("/user/support");
};


// 取得 FAQ 分類
const loadCategories = async () => {
    const res = await supportAxios.get("/api/questions/category");
    categories.value = res.data;
};

// 選擇分類 → 載入文章
const selectCategory = async (cat) => {

    selectedCategory.value = cat;

    const res = await supportAxios.get(`/api/questions?categoryId=${cat.categoryId}`);
    questions.value = res.data.filter(q => q.status === 1);

    openId.value = null; // 重置展開項目
    nextTick(() => {
        const el = document.getElementById("faq-result");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    });
};

// 展開/收合單一文章
const toggle = (id) => {
    openId.value = openId.value === id ? null : id;
};

// 搜尋功能

const search = async () => {
    const res = await supportAxios.get(`/api/questions/search?keyword=${keyword.value}`);
    questions.value = res.data;

    // 把搜尋結果第一筆的分類顯示出來
    questions.value = res.data.filter(q => q.status === 1);

    if (questions.value.length > 0) {
        selectedCategory.value = questions.value[0].category;
        nextTick(() => {
            const el = document.getElementById("faq-result");
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        });

    } else {
        selectedCategory.value = null;
    }

    openId.value = null;
    keyword.value = "";
};




onMounted(loadCategories);
</script>

<style scoped>
.search-box {
    max-width: 600px;
    margin: 0 auto;
}

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

/* ===== header ===== */
.faq-header {
    background-color: #f8f9fa;
}

.search-input-faq {
    width: 300px;
    max-width: 80%;
}

/* ===== category cards ===== */
.category-card {
    cursor: pointer;
    transition: 0.2s;
}

.category-card.active,
.category-card:hover {
    color: white;
    background-color: #0a8a75;

}

/* ===== question accordion ===== */
.faq-question {
    border: 1px solid #ccc;
    background: #fff;
    padding: 15px 18px;
    border-radius: 6px;
    font-size: 16px;
    transition: 0.2s;
}

.faq-question:hover {
    background-color: #f7f7f7;
}

.faq-answer {
    background-color: #fafafa;
    border-left: 3px solid #2b5f75;
    border-radius: 0 0 6px 6px;
    margin-top: -6px;
}

.faq-answer-html p {
    margin: 0;
    padding: 0;
}

.category-card.highlight {
    background-color: #0a8a75;
    color: white;
}

/* RWD */
@media (max-width: 768px) {

    .faq-wrapper .search-box {
        padding-left: 10px;
        padding-right: 10px;
    }

    .faq-wrapper .search-input {
        width: 90%;
    }

    .faq-wrapper .category-card {
        padding: 20px;
    }

    .faq-wrapper h1 {
        font-size: 28px;
    }

    .faq-wrapper .faq-question {
        font-size: 15px;
    }
}
</style>
