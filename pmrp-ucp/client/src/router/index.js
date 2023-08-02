import { createRouter, createWebHistory } from 'vue-router';

import loginPage from '../components/loginPage.vue';
import landingPage from '../components/landingPage.vue';

const routes = [
    {
        path: '/login',
        component: loginPage
    },
    {
        path: '/home',
        component: landingPage
    },
    {
        path: "/:catchAll(.*)",
        component: loginPage
    }
]

const router = createRouter({
    routes,
    history: createWebHistory()
})


export default router;