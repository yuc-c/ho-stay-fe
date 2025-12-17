import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/admin/views/AdminLayout.vue'

import SupportList from '@/admin/views/SupportComponent/SupportList.vue'
import SupportDetail from '@/admin/views/SupportComponent/SupportDetail.vue'
import SupportCategory from '@/admin/views/SupportComponent/SCategoryManage.vue'
import ReasonManage from '@/admin/views/SupportComponent/ReasonManage.vue'
import ExportSupport from '@/admin/views/SupportComponent/ExportSupport.vue'
import ArticleList from '@/admin/views/SupportComponent/ArticleList.vue'
import ArticleCreate from '@/admin/views/SupportComponent/ArticleCreate.vue'
import QCategoryManage from '@/admin/views/SupportComponent/QCategoryManage.vue'


const routes = [

    // 直接進後台 → 自動導向 /admin/supportList
    { path: '/', redirect: '/admin/supportList' },

    // 🔹 後台主架構
    {
        path: '/admin',
        component: AdminLayout,   // ⭐ 後台框架（包含 Sidebar）
        children: [
            { path: 'supportList', component: SupportList },
            { path: 'support/:id', component: SupportDetail, props: true },
            { path: 'supportCategory', component: SupportCategory },
            { path: 'reasonmanage', component: ReasonManage },
            { path: 'report/export', component: ExportSupport },

            // FAQ
            { path: 'faq/articles', component: ArticleList },
            { path: 'faq/articles/create', component: ArticleCreate },
            {
                path: 'faq/articles/edit/:id',
                name: 'ArticleEdit',
                component: ArticleCreate,
                props: true
            },
            { path: 'faqCategory', component: QCategoryManage },
        ]
    }
]

const router = createRouter({
    history: createWebHistory('/admin.html'),
    routes
})

export default router
