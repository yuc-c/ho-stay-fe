<template>
    <!-- 頁面標題 -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-3">
        <UsersIcon class="w-8 h-8 text-foreground" />
        <h1 class="text-3xl font-bold text-foreground">使用者管理</h1>
      </div>
    </div>
    
    <div class="d-flex align-items-center mb-4 control-bar-container">
      <div class="flex flex-col">
          <label class="block text-sm font-semibold text-foreground mb-2">搜尋使用者</label>
          <input
            @input="searchUser($event.target.value)"
            type="text"
            placeholder="輸入使用者姓名或 Email"
            class="audit-filter-input w-full px-3 py-2 border-2 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
          />
        </div>
    </div>
    
      <div class="bg-card rounded-lg border border-border p-6">
      <div  class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border ho-table-header">
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">使用者ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">姓名</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">電話</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">Email</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">生日</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">發送驗證信</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-border ho-table-row transition-colors"
            >
              <td class="px-4 py-4 text-foreground font-medium">{{user.id}}</td>
              <td class="px-4 py-4 text-foreground">{{ user.lastName }}{{ user.firstName }}</td>
              <td class="px-4 py-4 text-foreground">{{user.phoneNumber }}</td>
              <td class="px-4 py-4 text-foreground">{{ user.email }}</td>
              <td class="px-4 py-4 text-foreground">{{ user.dateOfBirth }}</td>
              <td class="px-4 py-4">
                <button
                  class="px-4 py-2 text-sm font-semibold border-2 border-primary/80 text-primary bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-primary"
                  @click="sendVerifyMail(user.email)"
                  >
                  發送驗證信
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

     <!-- 分頁 -->
      <div v-if="users.length > 0" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          顯示第 {{ currentPage * size + 1 }}-{{ Math.min((currentPage + 1) * size, totalElements) }} 筆，共 {{ totalElements }} 筆記錄
        </p>
        <div class="flex gap-2">
          <button 
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 0"
            class="px-3 py-1 border border-border rounded-lg bg-background text-foreground hover:bg-muted hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <button 
            v-for="page in getPageNumbers()" 
            :key="page"
            @click="handlePageChange(page - 1)"
            class="px-3 py-1 rounded-lg transition-colors min-w-[2.5rem]"
            :class="currentPage === page - 1 
              ? 'bg-primary text-primary-foreground' 
              : 'border border-border bg-background text-foreground hover:bg-muted hover:border-primary'"
          >
            {{ page }}
          </button>
          <button 
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="px-3 py-1 border border-border rounded-lg bg-background text-foreground hover:bg-muted hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import { UsersIcon } from '@/administrant/components/icons'
import { getUserList, findByUserIdOrName } from "@/administrant/api/user.js";
import { ChevronLeftIcon, ChevronRightIcon } from '@/administrant/components/icons'
import { axiosInstance } from "../api";
import Swal from "sweetalert2";
const users = ref([])
const size = ref(10);
const totalPages = ref(0);
const totalElements = ref(0);
const currentPage = ref(0);

function handlePageChange(page){
  currentPage.value = page;
  fetchUser();
}

// 計算要顯示的頁碼（固定顯示5個按鈕，確保位置一致）
const getPageNumbers = () => {
  const maxPages = 5 // 最多顯示 5 個頁碼按鈕
  const current = currentPage.value + 1 // 轉換為 1-based
  const total = totalPages.value
  
  if (total <= maxPages) {
    // 如果總頁數少於等於 5，顯示所有頁碼
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  // 固定顯示 5 個按鈕，根據當前頁面智能選擇範圍
  let start, end
  
  if (current <= 3) {
    // 在前3頁時，固定顯示 1-5
    start = 1
    end = 5
  } else if (current >= total - 2) {
    // 在最後3頁時，固定顯示最後5頁
    start = total - 4
    end = total
  } else {
    // 在中間頁面時，當前頁在中間，前後各2頁
    start = current - 2
    end = current + 2
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

async function fetchUser(){
    const params = {
      pageNumber:currentPage.value,
      size:size.value
    }
    try{
      const response = await getUserList(params);
      users.value = response.content;
      totalPages.value = response.totalPages;
      totalElements.value = response.totalElements;
    } catch (error){
      console.log(error)
    }
} 
async function searchUser(searchQuery){
  currentPage.value = 0;
  const params = {
    pageNumber:currentPage.value,
    size:size.value,
    keyword: searchQuery
  }
  try {
    const response = await findByUserIdOrName(params);
    console.log("response" + response);
    users.value = response.content;
    totalPages.value = response.totalPages;
    totalElements.value = response.totalElements;
  } catch (error){
    console.log(error)
  }
} 

function sendVerifyMail(email){
      Swal.fire({
      title: "已發送驗證信",
      icon: "success"
    });
    axiosInstance({
        method:"post",
        url:"/api/back/resendEmail",
        params:{
            email:email
        }
    })
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        console.log(error);
    })
}

onMounted(() => {
    fetchUser()
})
</script>

<style scoped>
/* 頁面內容置中和最大寬度控制 */
.user-management-container {
  max-width: 1200px; 
  margin: 0 auto; /* 水平置中 */
  padding: 20px;
}

/* 🌟 控制區塊容器：確保滿寬度對齊表格邊緣 */
.control-bar-container {
    width: 100%;
}

/* 🌟 搜尋輸入框容器：限制其佔用的總空間 */
.search-input-wrapper {
    width: 250px; 
    min-width: 250px;
    flex-shrink: 0; 
}

/* 🌟 右側佔位符：與 Input 容器寬度一致，用於平衡 */
.placeholder-wrapper {
    width: 250px;
    min-width: 250px;
    flex-shrink: 0;
}

/* 🌟 Input 樣式：佔滿其父容器 (search-input-wrapper) */
.input-field {
  width: 100%; 
  height: 40px; 
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem; 
}


/* 確保 Paginate 樣式可以正常顯示 */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
}
.pagination > li {
  margin-right: 0.25rem;
}
.pagination > li > a,
.pagination > li > span {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  line-height: 1.25;
  color: #007bff;
  background-color: #fff;
  border: 1px solid #dee2e6;
  text-decoration: none;
}
.pagination > li.active > a,
.pagination > li.active > span {
  z-index: 1;
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}
.pagination > li.disabled > a,
.pagination > li.disabled > span {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}
</style>