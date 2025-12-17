<template>
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>飯店名稱</th>
        <th>房間名稱</th>
        <th>日期</th>
        <th>庫存數量</th>
        <th>價格</th>
        <th>操作</th>
      </tr>
    </thead>


    <tbody>
      <!-- ✅ 直接使用 props.inventorys，不需要前端排序 -->
      <tr v-for="item in inventorys" :key="item.id">
        <td>{{ item.room.hotel.name }}</td>
        <td>{{ item.room.name }}</td>
        <td>{{ formatDate(item.date) }}</td>
        <td>{{ item.stock }}</td>
        <td>{{ item.price }}</td>


        <td>
          <button
            type="button"
            class="btn btn-warning btn-sm me-2"
            @click="$emit('openUpdate', item)"
          >
            修改
          </button>


          <button
            type="button"
            class="btn btn-danger btn-sm"
            @click="$emit('delete', item.id)"
          >
            刪除
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>


<script setup>
const props = defineProps({
  inventorys: {
    type: Array,
    required: true
  }
})


// ✅ 移除前端排序邏輯，直接使用後端排序結果


// 格式化日期顯示 YYYY-MM-DD -> YYYY/MM/DD
function formatDate(dateStr) {
  return dateStr.replace(/-/g, '/');
}


defineEmits(['openUpdate', 'delete'])
</script>


<style>
/* 表格樣式 */
table.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}


table.table th {
  background-color: #d6f5dd;
  color: #1c6b35;
  font-weight: 600;
  padding: 10px;
}


table.table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}


/* 偶數欄顏色 */
table.table tbody tr:nth-child(even) {
  background-color: #f6fff8;
}


/* hover 效果 */
table.table tbody tr:hover {
  background-color: #def7e7;
  cursor: pointer;
}
</style>

