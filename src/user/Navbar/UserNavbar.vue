<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-deepgreen">
    <div class="container-fluid">
      <!-- 左邊平台名稱 -->
      <RouterLink class="navbar-brand fw-bold" to="/">🏠 好好住 HoHoStay</RouterLink>

      <!-- 漢堡按鈕-->
      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>


      <!-- Navbar 大螢幕版本 -->
      <ul class="navbar-nav ms-auto d-none d-lg-flex align-items-center">
        <!-- 未登入 -->
        <div v-if="token === ''" class="d-flex">


          <!-- cecily:加入常見問題按鈕 -->
          <li class="nav-item me-3">
            <RouterLink class="btn btn-outline-light" to="/user/faq">常見問題</RouterLink>
          </li>
          <!-------------------------->

          <li class="nav-item me-3">
            <RouterLink class="btn btn-outline-light" to="/user/login">登入</RouterLink>
          </li>
          <li class="nav-item me-3">
            <RouterLink class="btn btn-outline-light" to="/user/registry">註冊</RouterLink>
          </li>
        </div>
        <!-- 已登入 -->
        <div v-if="token !== ''" class="d-flex">
          <li class="nav-item mt-2">
            <RouterLink class="btn btn-outline-light me-3" to="/user/become-host" v-if="isUser">註冊成為房東
            </RouterLink>
          </li>
          <li class="nav-item mt-2" v-if="isOwner">
            <RouterLink class="btn btn-outline-light me-3" to="/pages/backorders">歷史訂單</RouterLink>
          </li>
          <li class="nav-item mt-2" v-if="isOwner">
            <RouterLink class="btn btn-outline-light me-3" to="/pages/bookingreply">回覆評論</RouterLink>
          </li>
          <li class="nav-item mt-2" v-if="isOwner">
            <RouterLink class="btn btn-outline-light me-3" to="/pages/inventory">庫存管理</RouterLink>
          </li>
          <li class="nav-item mt-2" v-if="isOwner">
            <a class="btn btn-outline-light me-3" href="/owner.html" target="_self">飯店管理</a>
          </li>





          <li class="nav-item mt-2" v-if="isAdmin">
            <a class="btn btn-outline-light me-3" href="/administrant.html/dashboard" target="_self">管理者後台</a>
          </li>
          <li class="nav-item mt-2" v-if="isAdmin">
            <a class="btn btn-outline-light me-3" href="/admin.html">客服後台</a>
          </li>
          <li class="nav-item dropdown me-3">
            <a class="nav-link dropdown-toggle text-light d-flex align-items-center" href="#" id="userDropdown"
              data-bs-toggle="dropdown" aria-expanded="false">
               <img :src="`${photoPath}?photoUrl=${userStore.photo}`" alt="User" class="rounded-circle me-2 border border-2 border-light" width="40" height="40" />
                Hi, {{ lastName }} {{ firstName }}
            </a>
            <ul class="dropdown-menu">
               <!-- Oscar: 個人資料 -->
  <li>
    <RouterLink class="dropdown-item" to="/user/profile">個人資料</RouterLink>
  </li>
  <!-- Oscar: 我的訂單 -->
  <li>
    <RouterLink class="dropdown-item" to="/user/bookinglist">我的訂單</RouterLink>
  </li>
              <li>
                <RouterLink class="dropdown-item" to="/user/wishlist">收藏清單</RouterLink>
              </li>

              <!-- cecily:加入常見問題按鈕 -->
              <li>
                <RouterLink class="dropdown-item" to="/user/faq">常見問題</RouterLink>
              </li>

              <!-- cecily:加入客服中心按鈕 -->
              <li>
                <RouterLink class="dropdown-item" to="/user/support">客服中心</RouterLink>
              </li>
              <!-------------------------->

              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/" @click="logout">登出</RouterLink>
              </li>
            </ul>
          </li>
        </div>
      </ul>

      <!-- Offcanvas 小螢幕版本 -->
      <div class="offcanvas offcanvas-start bg-deepgreen d-lg-none" tabindex="-1" id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasNavbarLabel">
            <RouterLink class="navbar-brand fw-bold" to="/">🏠 訂房平台</RouterLink>
          </h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav flex-grow-1 pe-3">
            <!-- 未登入 -->
            <div v-if="token === ''">

              <!-- cecily:加入常見問題按鈕 -->
              <li v-if="!token" class="nav-item" data-bs-dismiss="offcanvas">
                <RouterLink class="nav-link text-light" to="/user/faq">常見問題</RouterLink>
              </li>
              <!-------------------------->

              <li v-if="!token" class="nav-item" data-bs-dismiss="offcanvas">
                <RouterLink class="nav-link text-light" to="/user/login">登入</RouterLink>
              </li>
              <li v-if="!token" class="nav-item" data-bs-dismiss="offcanvas">
                <RouterLink class="nav-link text-light" to="/user/registry">註冊</RouterLink>
              </li>
            </div>

            <!-- 已登入 -->
            <div v-if="token !== ''">
              <li class="text-light">
                 <img :src="`${photoPath}?photoUrl=${userStore.photo}`" alt="User" class="rounded-circle me-2 border border-2 border-light" width="40" height="40" />
                  Hi, {{ firstName }} {{ lastName }}
              </li>

                <!-- Oscar: 個人資料 -->
  <li class="nav-item" data-bs-dismiss="offcanvas">
    <RouterLink class="nav-link text-light" to="/user/profile">個人資料</RouterLink>
  </li>

  <!-- Oscar: 我的訂單 -->
  <li class="nav-item" data-bs-dismiss="offcanvas">
    <RouterLink class="nav-link text-light" to="/user/bookinglist">我的訂單</RouterLink>
  </li>
              <li class="nav-item" data-bs-dismiss="offcanvas">
                <RouterLink class="nav-link text-light" to="/user/become-host" v-if="isUser">註冊成為房東
                </RouterLink>
              </li>
              <li class="nav-item" v-if="isOwner">
            <RouterLink class="nav-link text-light" to="/pages/backorders">歷史訂單</RouterLink>
          </li>
          <li class="nav-item" v-if="isOwner">
            <RouterLink class="nav-link text-light" to="/pages/bookingreply">回覆評論</RouterLink>
          </li>
          <li class="nav-item" v-if="isOwner">
            <RouterLink class="nav-link text-light" to="/pages/inventory">庫存管理</RouterLink>
          </li>
              <li class="nav-item" data-bs-dismiss="offcanvas" v-if="isOwner">
                <a class="nav-link text-light" href="/owner.html" target="_self">飯店管理</a>
              </li>
              <li class="nav-item" data-bs-dismiss="offcanvas" v-if="isAdmin">
                <a class="nav-link text-light" href="/administrant.html/dashboard" target="_self">管理者後台</a>
              </li>
              <li class="nav-item" data-bs-dismiss="offcanvas" v-if="isAdmin">
                <a class="nav-link text-light" href="/admin.html" target="_self">客服後台</a>
              </li>
              <li class="nav-item" data-bs-dismiss="offcanvas">
                <RouterLink class="nav-link text-light" to="/user/wishlist">收藏清單</RouterLink>
              </li>

              <!-- cecily:加入客服中心按鈕 -->
              <li>
                <RouterLink class="nav-link text-light" to="/user/support">客服中心</RouterLink>
              </li>
              <!-------------------------->

              <li class="nav-item" data-bs-dismiss="offcanvas">
                <RouterLink class="nav-link text-light" to="/" @click="logout">登出</RouterLink>
              </li>
            </div>
          </ul>
        </div>
      </div>


    </div>
  </nav>

  <RouterView />
</template>

<script setup>
const photoPath = import.meta.env.VITE_PROFILE_PHOTO_URL; 
import { computed } from 'vue';
import useUserStore from '@/user/stores/user.js';
import myAxios from '@/user/plugin/axios';
const userStore = useUserStore();
const firstName = computed(() => userStore.firstName);
const lastName = computed(() => userStore.lastName);
const token = computed(() => userStore.token);
const roles = computed(() => userStore.role);

// 檢查是否為管理者 (role_id = 1)
const isAdmin = computed(() => {
  console.log('檢查管理者權限，roles.value:', roles.value);
  console.log('roles.value 類型:', typeof roles.value, '是否為陣列:', Array.isArray(roles.value));

  if (!roles.value) {
    console.log('roles.value 為空');
    return false;
  }

  // 如果是陣列
  if (Array.isArray(roles.value)) {
    console.log('roles 是陣列，長度:', roles.value.length);
    const hasAdmin = roles.value.some(role => {
      console.log('檢查 role:', role, 'role 的所有屬性:', Object.keys(role));
      // 支援多種可能的屬性名稱和格式
      const isAdminRole =
        role.roleId === 1 ||
        role.role_id === 1 ||
        role.id === 1 ||
        role.name === '管理員' ||
        role.name === '管理者' ||
        role.name === 'Admin' ||
        role.name === 'admin' ||
        (role.role && role.role.id === 1) ||
        (role.role && role.role.roleId === 1) ||
        (role.role && role.role.name === '管理員');
      console.log('此 role 是否為管理者:', isAdminRole);
      return isAdminRole;
    });
    console.log('最終是否有管理者權限:', hasAdmin);
    return hasAdmin;
  }

  // 如果是單一物件
  if (typeof roles.value === 'object') {
    console.log('roles 是物件:', roles.value, '所有屬性:', Object.keys(roles.value));
    const role = roles.value;
    const hasAdmin =
      role.roleId === 1 ||
      role.role_id === 1 ||
      role.id === 1 ||
      role.name === '管理員' ||
      role.name === '管理者' ||
      role.name === 'Admin' ||
      role.name === 'admin' ||
      (role.role && role.role.id === 1) ||
      (role.role && role.role.roleId === 1) ||
      (role.role && role.role.name === '管理員');
    console.log('是否有管理者權限:', hasAdmin);
    return hasAdmin;
  }

  console.log('roles 格式不符合預期');
  return false;
});
// 檢查是否「唯一」為一般使用者 (role_id = 2)
// 只有當用戶角色唯一為 role_id = 2 時才顯示「註冊成為房東」按鈕
// 如果同時擁有其他角色（例如房東 role_id = 3），則隱藏該按鈕
const isUser = computed(() => {
  if (!roles.value) return false;

  // 陣列格式（多角色）
  if (Array.isArray(roles.value)) {
    // 必須只有一個角色且該角色為 role_id = 2
    if (roles.value.length !== 1) return false;
    const roleId = roles.value[0]?.role_id ?? roles.value[0]?.roleId ?? roles.value[0]?.id;
    return roleId === 2;
  }

  // 單一物件格式
  if (typeof roles.value === 'object') {
    const roleId = roles.value.role_id ?? roles.value.roleId ?? roles.value.id;
    return roleId === 2;
  }

  return false;
});



function findRole(inputRole) {
  if (!roles.value) {
    return false;
  }
  
  // 處理陣列格式
  if (Array.isArray(roles.value)) {
    for (const role of roles.value) {
      if (!role) continue;
      
      // 檢查角色名稱
      if (inputRole === role.name) {
        return true;
      }
      
      // 如果輸入是「業者」，也檢查 role_id === 3 或名稱「房東」
      if (inputRole === '業者') {
        const roleId = role.role_id ?? role.roleId ?? role.id;
        if (roleId === 3 || role.name === '房東' || role.name === '業者') {
          return true;
        }
      }
    }
    return false;
  }
  
  // 處理單一物件格式
  if (typeof roles.value === 'object') {
    const role = roles.value;
    
    // 檢查角色名稱
    if (inputRole === role.name) {
      return true;
    }
    
    // 如果輸入是「業者」，也檢查 role_id === 3 或名稱「房東」
    if (inputRole === '業者') {
      const roleId = role.role_id ?? role.roleId ?? role.id;
      if (roleId === 3 || role.name === '房東' || role.name === '業者') {
        return true;
      }
    }
    
    return false;
  }
  
  return false;
}

// 檢查是否為房東（role_id = 3）
// 注意：用戶可能同時擁有多個角色（例如 role_id = 2 一般使用者 + role_id = 3 房東）
// 只要角色陣列中包含 role_id = 3，就視為房東
const isOwner = computed(() => {
  if (!roles.value) {
    return false;
  }
  
  // 處理陣列格式（用戶可能有多個角色）
  if (Array.isArray(roles.value)) {
    return roles.value.some(role => {
      if (!role) return false;
      const roleId = role.role_id ?? role.roleId ?? role.id;
      return roleId === 3;
    });
  }
  
  // 處理單一物件格式
  if (typeof roles.value === 'object') {
    const role = roles.value;
    const roleId = role.role_id ?? role.roleId ?? role.id;
    return roleId === 3;
  }
  
  return false;
});
function logout() {
  console.log('logout');
  // 先清除所有存儲的數據
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('adminUserName');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('adminFirstName');
  localStorage.removeItem('adminLastName');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('pinia-user');
  
  // 清除 Pinia store（必須在清除 sessionStorage 之後）
  userStore.clearUser();
  
  // 調用後端登出 API
  myAxios({
    method: 'get',
    url: '/api/logout'
  })
    .then(response => { 
      console.log(response);
      // 登出成功後刷新頁面，確保所有狀態都被重置
      window.location.href = '/user.html';
    })
    .catch(error => {
      console.log(error);
      // 即使 API 失敗也刷新頁面
      window.location.href = '/user.html';
    });
}


</script>

<style>
.bg-deepgreen {
  background-color: #0f4d46 !important;
  background-image: none !important;
  box-shadow: none !important;
}

/* 頭像樣式 */
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

/* 讓導覽列項目垂直置中 */
.navbar-nav .nav-link {
  color: #ffffff !important;
  font-weight: 500;
}

.navbar-nav .nav-link:hover {
  color: #c1f3e0 !important;
}

.navbar {
  padding: 0.6rem 1rem;
}

/* Offcanvas 內容背景顏色 */
.offcanvas-body {
  background-color: #0f4d46 !important;
}

.offcanvas-nav .nav-link {
  color: #ffffff !important;
  font-weight: 500;
}

.offcanvas-nav .nav-link:hover {
  color: #c1f3e0 !important;
}
</style>
