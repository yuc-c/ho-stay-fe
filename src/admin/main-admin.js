import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'


import router from './router'


import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/admin/assets/admin-theme.css'



// --- 修復 login 存成 id 而非 userId 的問題 ---
function fixHoUser() {
    let rawUser = JSON.parse(localStorage.getItem("hoUser"));

    // hoUser存在，而且組員登入後是 { id: 88 }
    if (rawUser && rawUser.id && !rawUser.userId) {
        rawUser.userId = rawUser.id;      // 自動補上 userId
        sessionStorage.setItem("hoUser", JSON.stringify(rawUser));
        console.log("已修復 hoUser：補上 userId =", rawUser.userId);
    }
}

fixHoUser();
// ---------------------------------------------





const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')       
