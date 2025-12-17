<template>
  <div class="ho-app">
    <template v-if="useSimpleLayout">
      <router-view />
    </template>
    <template v-else>
      <AdminLayout>
        <router-view />
      </AdminLayout>
      <DarkModeToggle />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/administrant/components/AdminLayout.vue'
import DarkModeToggle from '@/administrant/components/DarkModeToggle.vue'

const route = useRoute()
const simpleLayoutRoutes = ['/login', '/home']
const useSimpleLayout = computed(() => simpleLayoutRoutes.includes(route.path))
</script>
