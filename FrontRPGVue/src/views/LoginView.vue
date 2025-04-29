<template>
  <div class="login-container">
    <div class="card">
      <h1 class="title">Connexion</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
              type="email"
              id="email"
              v-model="form.email"
              required
              class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe:</label>
          <input
              type="password"
              id="password"
              v-model="form.password"
              required
              class="form-control"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </form>

      <div class="register-link">
        Vous n'avez pas de compte?
        <router-link to="/register">S'inscrire</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',

  setup() {
    const store = useStore()
    const router = useRouter()

    const form = ref({
      email: '',
      password: ''
    })

    const error = ref('')
    const loading = ref(false)

    const onSubmit = async () => {
      error.value = ''
      loading.value = true

      try {
        const success = await store.dispatch('auth/login', {
          email: form.value.email,
          password: form.value.password
        })

        if (success) {
          router.push('/inventory')
        } else {
          error.value = 'Email ou mot de passe incorrect'
        }
      } catch (err) {
        error.value = 'Une erreur est survenue lors de la connexion'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      error,
      loading,
      onSubmit
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.card {
  width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}
</style>