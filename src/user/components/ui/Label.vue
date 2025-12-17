<template>
  <label
    :for="htmlFor"
    :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </label>
</template>

<script setup>
import { cn } from '@/user/lib/utils'

const props = defineProps({
  htmlFor: {
    type: String,
    default: ''
  }
})
</script>

