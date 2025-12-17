<template>
  <div>
    <!-- 導航列 -->
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <span class="navbar-brand">HoHoStay飯店</span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item">
              <RouterLink class="nav-link active" aria-current="page" to="/">切換前臺</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/pages/inventory">庫存專區</RouterLink>
            </li>
            <li class="nav-item dropdown">
              <span class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                訂單專區
              </span>
              <ul class="dropdown-menu">
                <li><RouterLink class="dropdown-item" to="/pages/backorders">所有訂單</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/pages/bookingreply">回覆評論</RouterLink></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 子頁面內容 -->
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
// import useUserStore from '@/user/stores/user.js';
// const userStore = useUserStore();
</script>

<style scoped>
.main-content {
  padding: 20px;
}
</style>
