<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="navbar-brand">
        <h2>RPG Manager</h2>
      </div>
      <div class="navbar-menu">
        <router-link to="/inventory" class="navbar-item">Inventaire</router-link>
        <router-link to="/characters" class="navbar-item">Personnages</router-link>
        <button @click="logout" class="navbar-item logout-btn">Déconnexion</button>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

    const logout = () => {
      store.dispatch('auth/logout')
      router.push('/login')
    }

    return {
      isAuthenticated,
      logout
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #343a40;
  color: white;
}

.navbar-brand h2 {
  margin: 0;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
}

.navbar-item {
  color: white;
  text-decoration: none;
}

.logout-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>