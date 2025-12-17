<template>

    <div class="booking-form-container">
    <p class="form-description">請填寫主要的訂購人資訊以及您的預訂細節。</p>

    <div class="form-section">
      <h3>主要訂購人資訊</h3>
            <p>姓名: {{ userLastName }} {{ userFirstName }}</p>
            <p>電子郵件: {{ email }}</p>
            <label>電話: </label>
            <input type="text" placeholder="請輸入電話號碼" v-model="phone" class="input-field"></input>
    </div>
     <div class="form-section">
        <h3>主要住客</h3>
        <div class="radio-button"> 
            <input type="radio" name="guest" v-model="guest" value="self" @change="onGuestChange">同訂購者
            <input type="radio" name="guest" v-model="guest" value="other" @change="onGuestChange">幫別人訂房
        </div>
        <div v-if="changeLeadGuest" class="input-group">
                <label for="leadGuest">主要住客姓名</label>
                <input 
                id="leadGuest"
                v-model="leadGuest"
                type="text"
                placeholder="請輸入主要住客姓名"
                />
        </div>
     
    </div>
        <div>
    </div>
     <div class="form-section date-coupon-section">

      <div class="input-group">
        <label for="couponSn">優惠券代碼</label>
        <input 
          id="couponSn"
          type="text"
          placeholder="請輸入優惠券代碼"
          v-model="couponSn"
          @change="checkCoupon"
          @input="clearMessage"
        />
        <span class="coupon" v-if="coupon">{{ coupon.name }}</span>
        <span class="errorMessage" v-if="couponMessage.length != 0">{{ couponMessage }}</span>
      </div>
    </div>

    <div class="form-section">
      <h3>抵達資訊</h3>
      <div class="input-group">
        <label for="arrivalTime">預計抵達時間</label>
        <select 
          id="arrivalTime"
          class="time-select"
        >
          <option value="" disabled>-- 請選擇您的預計抵達時間 --</option>
          <option v-for="time in timeOptions" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
        <small class="hint">請告知我們您預計抵達的時間，以便為您準備。</small>
      </div>
    </div>

    <div class="form-section">
      <h3>特殊要求</h3>
      <div class="input-group">
        <label for="request">特殊要求 / 備註</label>
        <textarea 
          id="request"
          placeholder="例如：高樓層、素食餐點、延遲入住等"
          rows="3"
          v-model="request"
        ></textarea>
      </div>
    </div>
    <button type="submit" class="submit-btn" @click="submitBooking">前往付款</button>
    <form ref="ecpayForm" method="POST" :action="paymentUrl" style="display: none;">
      <input v-for="(value, key) in formData" :key="key" 
             :name="key" :value="value" type="hidden" />
    </form>
    </div>
</template>

<script setup>
import Swal from "sweetalert2";
import { onMounted, ref, nextTick } from 'vue';
import useUserStore from '@/user/stores/user.js';
import useHotelStore from '@/user/stores/hotel.js';
const hotelStore = useHotelStore();
import myAxios from '@/user/plugin/axios';
const props = defineProps(["bookingInventoriesDto","roomDetail", "modelValue"]);
const emits = defineEmits(['update:modelValue'])
const userStore = useUserStore();
const guest = ref("");
const leadGuest = ref("");
const timeOptions = [];
const couponSn = ref("");
const coupon = ref({});
const couponMessage = ref("");
const request = ref("");
for (let h = 0; h <= 23; h++) {
  timeOptions.push(`${String(h).padStart(2, '0')}:00`);
  if (h <= 23) {
    timeOptions.push(`${String(h).padStart(2, '0')}:30`);
  }
}
function checkCoupon(){
  couponMessage.value = '';
  coupon.value = {};

  if (couponSn.value.length != 0){
    myAxios({
      method: 'get',
      url: '/api/coupons/validate',
      params: {
        sn:couponSn.value
      }
  })
    .then(response => {
      console.log(response);
      coupon.value = response.data;
      emits('update:modelValue', coupon.value);
    })
    .catch(error => {
      console.log(error);
      couponMessage.value = error.response.data;
    });
  }
}
function clearMessage(){
  couponMessage.value = '';
  coupon.value = null;
  emits('update:modelValue', coupon.value);
}

const roomName = props.roomDetail.map(room => room.name);
const bookingDto = ref({});

// console.log(bookingDto.value);
//提交預訂資訊並
const ecpayForm = ref(null);
const paymentUrl = ref("");
const formData = ref({});
function submitBooking() {
  bookingDto.value = {
      userId:userStore.id,
      phone:phone.value,
      startDate: hotelStore.searchData.checkInDate,
      endDate: hotelStore.searchData.checkOutDate,
      couponSn: couponSn.value,
      request: request.value,
      leadGuest: leadGuest.value,
      roomName: roomName,
      bookingInventoriesDto: props.bookingInventoriesDto
    }
  myAxios.post('/api/user/booking', bookingDto.value)
    .then(res => {
      console.log('預訂成功', res);
      paymentUrl.value = res.data.PaymentUrl;
      const {PaymentUrl, ...params} = res.data;
      formData.value = params;
      console.log(paymentUrl.value);
      //等待DOM渲染完畢
      nextTick().then(() => {
        console.log('準備提交表單');
        if (ecpayForm.value) {
          ecpayForm.value.submit();
        } else {
          console.error('❌ 找不到表單元素');
        }
      });
    })
    .catch(err => {
      console.error('預訂失敗', err);
    });
}

//增加leadGuest的表格
let changeLeadGuest = ref(false)
function onGuestChange(event) {
  if (event.target.value === 'self'){
    changeLeadGuest.value = false
    leadGuest.value = `${userLastName.value} ${userFirstName.value}`

  } else {
    changeLeadGuest.value = true;
    leadGuest.value = '';
  }
}

//一進到畫面取得使用者資料帶入
let userFirstName = ref("");
let userLastName = ref("");
let phone = ref("");
let email = ref("");
function fetchUser() {
  myAxios.get('/api/user',{
})
    .then(response => {
      console.log(response);
      userFirstName.value = response.data.userFirstName;
      userLastName.value = response.data.userLastName;
      phone.value = response.data.phone == null ? "" : response.data.phone;
      email.value = response.data.email;
    })
    .catch(error => {
      console.error("取得使用者資料失敗:", error);
    });
}
onMounted(() => {
  fetchUser();
})
</script>

<style scoped>
.booking-form-container {
  max-width: 600px;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

/* 子標題：湖水綠 */
h3 {
  color: #00a896; 
  margin-top: 20px;
  margin-bottom: 15px;
  font-size: 18px;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}


.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  margin-bottom: 10px;
}

.input-group input:focus, .input-group textarea:focus {
    /* 焦點邊框：湖水綠 */
    border-color: #00a896;
    outline: none;
}

.input-group.required label:before {
    /* 必填星號：紅色 */
    content: "* ";
    color: #e61e4d;
}

/* --- 提交按鈕 --- */
.submit-btn {
  width: 100%;
  padding: 15px;
  /* 提交按鈕：湖水綠 */
  background-color: #00a896; 
  color: white;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 30px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  /* Hover 效果：深湖水綠 */
  background-color: #008f80;
}

.form-description {
    color: #666; margin-bottom: 30px; 
}
.form-section {
    padding: 15px 0; border-top: 1px dashed #eee;
}
.radio-button {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
}
.errorMessage {
  color: red;
}
.input-field {
  width: 50%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  margin-bottom: 10px;
}
.coupon {
  color: red;
}
</style>