import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import InventoryView from '../views/InventoryView.vue'
import CharacterView from '../views/CharacterView.vue'
import GameView from '../views/GameView.vue'
import store from '../store'

const routes = [
    {
        path: '/',
        redirect: '/inventory'
    },
    {
        path: '/login',
        component: LoginView,
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        component: RegisterView,
        meta: { requiresAuth: false }
    },
    {
        path: '/inventory',
        component: InventoryView,
        meta: { requiresAuth: true }
    },
    {
        path: '/characters',
        component: CharacterView,
        meta: { requiresAuth: true }
    },
    {
        path: '/games',
        name: 'games',
        component: GameView,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = store.getters['auth/isAuthenticated']
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
        next('/inventory')
    } else {
        next()
    }
})

export default router