<script setup>
import { RouterView } from 'vue-router'
import Toaster from '@/user/components/ui/Toaster.vue'
</script>

<template>
  <div class="hotel-management">
    <Toaster />
    <RouterView />
  </div>
</template>

<style scoped></style>
