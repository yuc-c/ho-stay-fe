<template>
    <div>
        <span v-if="total <= 0">查無資料</span>
        <div v-else>
        <span >查到{{ total }}筆資料</span>
        ，每頁顯示<select :value="modelValue" @change="doChange($event)">
            <template v-for="option in options" :key="option">
                <option :value="option">{{option}}</option>
            </template>
        </select>
        筆
        <span>根據
            <select :value="sortField" @change="changeSort">
                <option v-for="option in sortOptions" :key="option" :value="option.value" >{{ option.label }}</option>
            </select>
            由
            <select :value = "sortOrder" @change="changeSortOrder">
                <option v-for="option in sortOrderOptions" :key="option" :value="option.value">{{ option.label }}</option>
            </select>
        </span>排序
        </div>
    </div>
</template>
    
<script setup>
    const props = defineProps(["modelValue", "total", "options", "sortOptions", "sortField", "sortOrderOptions", "sortOrder"]);
    const emits = defineEmits(["update:modelValue", "selectChange", "update:sortField", "changeSort", "update:sortOrder"]);
    function doChange(event) {
        emits("update:modelValue", event.target.value);
        emits("selectChange");
    }
    function changeSort(event) {
        emits("update:sortField", event.target.value);
        emits("changeSort");
    }
    function changeSortOrder(event) {
        emits("update:sortOrder", event.target.value);
        emits("changeSort");
    }
</script>
    
<style>
    
</style>