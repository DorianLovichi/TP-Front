import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Initialize auth state
store.dispatch('auth/initializeAuth')

createApp(App)
    .use(router)
    .use(store)
    .mount('#app')