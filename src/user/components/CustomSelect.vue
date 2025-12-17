<template>
  <div class="custom-select" ref="selectContainer">
    <!-- ✅ 只在選中的區塊加 click，不用 @click.stop -->
    <div class="selected" @click="toggleOpen">
      {{ selectedLabel || placeholder }}
      <span class="arrow" :class="{ open }">▼</span>
    </div>

    <ul v-show="open" class="options">
      <li
        v-for="option in options"
        :key="option.value"
        @click="select(option)"
        :class="{ active: option.value === modelValue }"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: [String, Number],
  placeholder: { type: String, default: "請選擇" }
});

const emits = defineEmits(["update:modelValue"]);

const open = ref(false);
const selectContainer = ref(null);

// ✅ 計算顯示的文字
const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue);
  return found ? found.label : "";
});

// 開關下拉
function toggleOpen() {
  open.value = !open.value;
}

// 選擇選項
function select(option) {
  emits("update:modelValue", option.value);
  open.value = false; // ✅ 立即關閉
}

// ✅ 點外面關閉下拉（使用 ref 判斷）
function handleClickOutside(event) {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-size: 14px;
  user-select: none;
}

.selected {
  background-color: #4caf50;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.selected:hover {
  background-color: #45a049;
}

.arrow {
  margin-left: 8px;
  transition: transform 0.2s;
  font-size: 12px;
}

.arrow.open {
  transform: rotate(180deg);
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  color: #333;
  list-style: none;
  margin: 4px 0 0 0;
  padding: 0;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #4caf50;
}

.options li {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.options li:hover {
  background-color: #e8f5e9;
}

.options li.active {
  background-color: #c8e6c9;
  color: #2e7d32;
  font-weight: 600;
}

/* 美化捲軸 */
.options::-webkit-scrollbar {
  width: 6px;
}

.options::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.options::-webkit-scrollbar-thumb {
  background: #4caf50;
  border-radius: 8px;
}

.options::-webkit-scrollbar-thumb:hover {
  background: #45a049;
}
</style>