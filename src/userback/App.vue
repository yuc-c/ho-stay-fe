<script setup>

</script>

<template>
  <div>
    <MainNavbar v-if="!$route.meta.hideMainNavbar" />

    <RouterView />
  </div>
  
</template>

<style scoped></style>
