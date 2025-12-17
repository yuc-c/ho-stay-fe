<template>
<div class="row mb-3 gap-3"> </div>
<div class="row mb-3 gap-3"> </div>
<div class="row mb-3 gap-3"> </div>



  <div class="row mb-3">
  <div class="col-3">
    <button type="button" class="btn btn-primary"
            @click="openModal('single')">新增單筆庫存</button>
  </div>
  <div class="col-3">
    <button type="button" class="btn btn-primary"
            @click="openModal('range')">新增區間庫存</button>
  </div>
</div>
<!-- 分頁選頁項數 -->
<div class="col-6">
            <InventorySelect :total="total" :options="[ 5,10,15,20]" v-model="rows" @select-change="callFind">
            </InventorySelect>
        </div>
   
    <br>
<!-- 分頁元件 -->
    <div class="row">
        <div>
            <div class="pagination-container">
  <Paginate
    :first-last-button="true"
    first-button-text="&lt;&lt;"
    last-button-text="&gt;&gt;"
    prev-text="&lt;"
    next-text="&gt;"
    :page-count="pages"
    :initial-page="current"
    v-model="current"
    :click-handler="callFind"
    class="pagination"
  />
</div>
  <div class="current-info">
  第 {{ current }} 頁 / 共 {{ pages }} 頁（每頁 {{ rows }} 筆）
</div>
        </div>
    </div>
    <br>




    <InventoryTable
    :inventorys="inventorys"
    @openUpdate="openUpdate"
    @delete="callRemove"
  />




  <!-- Modal -->
  <InventoryModal
    v-if="modalVisible" :action="modalAction" :inventory="inventory"  :hotels="hotels"
    @update:inventory="onInventoryInput"
    @insertSingle="insertSingle"
    @insertRange="insertRange"
    @callModify="callModify"
    @close="modalVisible = false"
  />




 
</template>








<script setup>
import { ref, onMounted, computed } from 'vue';
import InventoryModal from '@/user/components/InventoryModal.vue';
import InventorySelect from "@/user/components/InventorySelect.vue";
import InventoryTable from "@/user/components/InventoryTable.vue";
import myAxios from '@/user/plugin/axios.js';
import Paginate from "vuejs-paginate-next";
import Swal from "sweetalert2";
import useUserStore from "@/user/stores/user.js";
const userStore = useUserStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



const inventory = ref({});
const modalAction = ref('');
const modalVisible = ref(false);




//分頁inventorys從後端取得資料




const total = ref(0);
const rows = ref(5);
const pages = ref(0);
const current = ref(1);
const start = ref(0);
const lastPageRows = ref(0);
const inventorys = ref([]);
const hotels = ref([]);




async function loadHotelsAndRooms() {
  try {
    const response = await myAxios.get(

       `${API_BASE_URL}/api/hotels/user/rooms`,

      { headers: { userId: userStore.userId } }
    );


    hotels.value = response.data || [];
    console.log('飯店與房型資料', hotels.value);


  } catch (err) {
    console.error('載入飯店失敗', err);
  }
}


// 開啟 Modal
function openModal(action) {
  modalAction.value = action;
  inventory.value = {};
  modalVisible.value = true;
}
function closeModal() {
  modalVisible.value = false;
  inventory.value = {};      // 選擇性：關閉時清空資料
  modalAction.value = '';    // 選擇性：清空 action
}
function openUpdate(item) {
  inventory.value = { ...item };   // 拿到完整資料
  modalAction.value = 'update';
  modalVisible.value = true;
}
function callFind(page) {
 
        if(page) {
            current.value = page;
            start.value = (page - 1) * rows.value;
        } else {
            current.value = 1;
            start.value = 0;
        }
       
        const request = {
            "start": start.value,
            "rows": rows.value,
            "sort": "date",  
            "dir": true,    
        };
        myAxios.post(
        `${API_BASE_URL}/api/inventory/query`,

  request, // 這是 body
  {
    headers: {
      userId: userStore.userId
    }
  }
).then(function(response) {
            console.log("response.data.data:", response.data.data);
        inventorys.value = response.data.data || [];
        total.value = response.data.total || inventorys.value.length; // 使用後端 total
        pages.value = Math.ceil(total.value / rows.value);
        lastPageRows.value = total.value % rows.value;
        // setTimeout(() => Swal.close(), 500);
    }).catch(function(error) {
            console.log("error", error);
            Swal.fire({
                text: "執行錯誤："+ error.message,
                icon: 'error',
            });
        });
    }
 
  async function callModify() {
        // console.log("callModify");
        Swal.fire({
            title: '處理中......',
            showConfirmButton: false,
            allowOutsideClick: false,
        });  
        if(inventory.value.price==="") {
            inventory.value.price = null;
        }
        if(inventory.value.stock==="") {
            inventory.value.stock = null;
        }  
        const request = inventory.value;
        try {

            const response = await myAxios.put(`${API_BASE_URL}/api/inventory/${inventory.value.id}`, request, {
                headers: {
                    "Authorization": `Bearer ${userStore.getToken()}`
                }
            });
            // 操作完成，先關閉 loading
            Swal.close();
            if(response.data.success) {
                await Swal.fire({
                    text: response.data.message,
                    icon: 'success'
                });
                callFind(current.value);
                closeModal();    
            } else {
                Swal.fire({
                    text: response.data.message,
                    icon: 'warning'
                });
            }
        } catch(error) {
            console.log("error", error);
            Swal.fire({
                text: "執行錯誤："+ error.message,
                icon: 'error'
            });
        }
    }




async function callRemove(id) {
        const result = await Swal.fire({
            text: "確定？",
            icon: "question",
            showDenyButton: true,
        });
        if(result.isConfirmed) {
            try {


                const response = await myAxios.delete( `${API_BASE_URL}/api/inventory/${id}`, {

                    headers: {
                        "Authorization": `Bearer ${userStore.getToken()}`
                    }
                });
                // console.log("response", response);




                if(response.data.success) {
                    await Swal.fire({
                        text: response.data.message,
                        icon: 'success',
                    });
                    if(lastPageRows.value===1 && current.value>1) {
                        current.value = current.value-1;
                    }
                    callFind(current.value);
                } else {
                    Swal.fire({
                        text: response.data.message,
                        icon: 'warning',
                    });
                }
            } catch(error) {
                // console.log("error", error);
                Swal.fire({
                    text: "執行錯誤："+ error.message,
                    icon: 'error',
                });
            }
        }
    }




// 處理 inventory 輸入
function onInventoryInput(value) {
  inventory.value = value;
}


function validateInventory(data) {
  const errors = [];
  if (!data.roomId) errors.push("房間未選擇");
  if (!data.date) errors.push("日期不可空白");
  if (data.stock === null || data.stock === undefined || data.stock === "") {
    errors.push("庫存數量不可空白");
  } else if (isNaN(data.stock) || data.stock < 0) {
    errors.push("庫存數量必須是 ≥ 0 的數字");
  }
  if (data.price === null || data.price === undefined || data.price === "") {
    errors.push("價格不可空白");
  } else if (isNaN(data.price) || data.price < 0) {
    errors.push("價格必須是 ≥ 0 的數字");
  }
  return errors;
}
// 新增單筆庫存
async function insertSingle() {
  const errors = validateInventory(inventory.value);
  if (errors.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: '資料格式不正確'
    });
    return;
  }


  // ✅ 準備正確格式的資料
  const payload = {
    roomId: Number(inventory.value.roomId),
    stock: Number(inventory.value.stock),
    price: Number(inventory.value.price),
    date: inventory.value.date
  };


  // 驗證數字是否有效
  if (isNaN(payload.stock) || isNaN(payload.price)) {
    Swal.fire({
      text: "庫存和價格必須是有效數字",
      icon: 'warning',
    });
    return;
  }


  console.log('送出的資料:', payload);


  try {
    const response = await myAxios.post(


       `${API_BASE_URL}/api/inventory/insert`,
      payload,
      { headers: { userId: userStore.userId } }
    );


    if (response.status === 201) {
      modalVisible.value = false;
      await Swal.fire({
        text: "新增成功",
        icon: 'success',
      });
      callFind(current.value);
    }
  } catch (error) {
    console.error('錯誤:', error.response || error);
   
    let errorMessage = "新增失敗";
    if (error.response?.data) {
      errorMessage = typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data);
    }
   
    Swal.fire({
      text: errorMessage,
      icon: 'error',
    });
  }
}


// 新增區間庫存
async function insertRange() {
  const errors = validateInventoryRange(inventory.value);
  if (errors.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: '資料格式不正確'      
    });
    return; // ❌ 不送出
  }


  try {
    const start = new Date(inventory.value.firstDate);
    const end = new Date(inventory.value.lastDate);
    const list = [];


    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      list.push({
        roomId: inventory.value.roomId,
        roomName: inventory.value.roomName,
        stock: inventory.value.stock,
        price: inventory.value.price,
        date: d.toISOString().slice(0, 10)
      });
    }


    const response = await myAxios.post(


      `${API_BASE_URL}/api/inventory/insertRange`,
      list,
      { headers: { userId: userStore.userId } } // ✅ headers 放這裡
    );


    if (response.data.success) {
      modalVisible.value = false; // ✅ 成功才關閉
      await Swal.fire({
        text: response.data.message,
        icon: 'success',
      });
      callFind(current.value);
    } else {
      Swal.fire({
        text: response.data.message,
        icon: 'warning',
      });
    }
  } catch (error) {
    Swal.fire({
      text: "新增失敗：" + error.message,
      icon: 'error',
    });
  }
}






function validateInventoryRange(data) {
  const errors = [];
  if (!data.roomId) errors.push("房間未選擇");
  if (!data.firstDate) errors.push("開始日期不可空白");
  if (!data.lastDate) errors.push("結束日期不可空白");
  if (data.firstDate && data.lastDate) {
    const start = new Date(data.firstDate);
    const end = new Date(data.lastDate);
    if (start > end) {
      errors.push("開始日期不可大於結束日期");
    }
  }
  if (data.stock === "" || data.stock === null || data.stock === undefined) {
    errors.push("庫存數量不可空白");
  } else if (isNaN(data.stock) || data.stock < 0) {
    errors.push("庫存數量必須是 ≥ 0 的數字");
  }
  if (data.price === "" || data.price === null || data.price === undefined) {
    errors.push("價格不可空白");
  } else if (isNaN(data.price) || data.price < 0) {
    errors.push("價格必須是 ≥ 0 的數字");
  }




  return errors;
}
onMounted(() => {
        callFind();
        loadHotelsAndRooms();




    });
</script>








<style scoped>
/* 標題 */
h3 {
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  color: #279f6a;
}




/* 薄荷綠按鈕 */
button.btn {
  width: 100%;
  margin-bottom: 5px;
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
  transition: 0.2s;
}
button.btn:hover {
  background-color: #3d8c41;
  border-color: #3d8c41;
}




/* 下拉選單框 */
select.form-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #b5d7c5;
  background-color: red; /* 框背景 */
  color: white; /* 框文字 */
  transition: 0.2s;
  -webkit-appearance: none; /* 去掉預設箭頭 */
  -moz-appearance: none;
  appearance: none;
}


/* hover & focus */
select.form-select:hover {
  border-color: #72c59c;
}


select.form-select:focus {
  border-color: #46a777;
  box-shadow: 0 0 0 2px rgba(70, 167, 119, 0.3);
  outline: none;
}


/* option 顏色（在 Windows/Firefox 可生效） */
select.form-select option {
  background-color: red;
  color: white;
}


/* 分頁區塊置中 */
.pagination-container {
  display: flex;
  justify-content: flex-start; /* 靠左 */
  margin-top: 10px;
}




/* 分頁按鈕美化 */
.pagination li {
  display: inline-block;
  margin: 0 2px;
}




.pagination li a {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #b9dec9;
  background-color: #f4fff7;
  cursor: pointer;
  transition: 0.2s;
}




.pagination li a:hover {
  background-color: #c7efd9;
  border-color: #72c59c;
}




/* 分頁 active */
.pagination li.active a {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}




/* 目前頁數提示 */
.current-info {
  text-align: center;
  margin-top: 10px;
  color: #3a9154;
  font-weight: 600;
}




</style>









