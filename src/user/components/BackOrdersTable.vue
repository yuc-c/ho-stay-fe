<template>
  <div class="card">
    <DataTable
      v-model:filters="filters"
      :value="sortedOrders"
      paginator
      :rows="10"
      filterDisplay="row"
      :loading="loading"
      :globalFilterFields="['userName', 'hotelName', 'roomName', 'status']"
      tableStyle="min-width: 70rem"
    >


      <!-- 表頭 -->
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-xl font-bold">訂單清單</span>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="關鍵字搜尋" />
          </IconField>
        </div>
      </template>


      <template #empty>查無訂單資料</template>
      <template #loading>載入中，請稍候...</template>


      <!-- 住宿日期 -->
      <Column field="startDate" header="住宿日期" sortable style="min-width: 10rem">
        <template #body="{ data }">
          {{ formatDate(data.startDate) }}
        </template>
      </Column>


      <!-- 訂房人 -->
      <Column field="userName" header="訂房人" sortable style="min-width: 10rem">
        <template #body="{ data }">
          {{ data.userName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="搜尋姓名"
          />
        </template>
      </Column>


      <!-- 旅館名稱 -->
      <Column field="hotelName" header="旅館" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.hotelName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="hotelNames"
            placeholder="選擇旅館"
            style="min-width: 12rem"
            :showClear="true"
          />
        </template>
      </Column>


      <!-- 房型 + 數量 -->
      <Column field="roomName" header="房型" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.roomName }} × {{ data.qty }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="roomTypes"
            placeholder="選擇房型"
            style="min-width: 12rem"
            :showClear="true"
          />
        </template>
      </Column>


      <!-- 總金額 -->
      <Column field="inventoryPrice" header="總金額" sortable style="min-width: 10rem">
        <template #body="{ data }">
          {{ data.inventoryPrice.toLocaleString('zh-TW') }} 元
        </template>
      </Column>


      <!-- 狀態 -->
      <Column field="status" header="狀態" sortable :showFilterMenu="false" style="min-width: 10rem">
        <template #body="{ data }">
          <Tag
            :value="data.status"
            :severity="getSeverity(data.status)"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="statuses"
            placeholder="選擇狀態"
            style="min-width: 10rem"
            :showClear="true"
          >
            <template #option="slotProps">
              <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
            </template>
          </Select>
        </template>
      </Column>


      <!-- footer -->
      <template #footer>
        共 {{ sortedOrders?.length ?? 0 }} 筆訂單
      </template>
    </DataTable>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';


// PrimeVue 元件
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';


// Props
const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});


// ✅ 狀態優先順序
const statusPriority = {
  '入住中': 1,
  '已預訂': 2,
  '完成訂單': 3
};


// ✅ 智能排序：優先按狀態，再按日期
const sortedOrders = computed(() => {
  if (!props.orders || props.orders.length === 0) return [];
 
  return [...props.orders].sort((a, b) => {
    const aPriority = statusPriority[a.status] || 999;
    const bPriority = statusPriority[b.status] || 999;
   
    // 先按狀態排序
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
   
    // 同狀態則按日期降序（新的在前）
    return new Date(b.startDate) - new Date(a.startDate);
  });
});


// 下拉選單選項
const statuses = ref(['入住中', '已預訂', '完成訂單']);


// 動態取得房型選項
const roomTypes = computed(() => {
  const types = [...new Set(props.orders.map(order => order.roomName))];
  return types.filter(Boolean);
});


// 動態取得旅館名稱選項
const hotelNames = computed(() => {
  const names = [...new Set(props.orders.map(order => order.hotelName))];
  return names.filter(Boolean);
});


// 篩選條件
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  userName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  hotelName: { value: null, matchMode: FilterMatchMode.EQUALS },
  roomName: { value: null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS }
});


// 日期格式化
const formatDate = (d) => {
  const date = new Date(d);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${m}-${day}`;
};


// 狀態顏色
const getSeverity = (status) => {
  switch (status) {
    case "入住中":
      return "info";
    case "已預訂":
      return "warn";  
    case "完成訂單":
      return "success";
    default:
      return null;
  }
};
</script>

