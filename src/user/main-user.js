import { createApp } from 'vue'
import App from './App.vue'
import Router from '@/user/routers/userRouter.js'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker&v=weekly&map_ids=MAP_ID`;
script.async = true;
script.defer = true;

document.head.appendChild(script);


createApp(App)
    .use(Router)
    .use(pinia)
    .use(PrimeVue, {
        theme: {
            preset: Aura
        }
    })
    .mount('#app')

