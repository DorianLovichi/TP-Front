<template>
  <div class="register-container">
    <div class="card">
      <h1 class="title">Inscription</h1>

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
          <label for="username">Nom d'utilisateur:</label>
          <input
              type="text"
              id="username"
              v-model="form.username"
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

        <div class="form-group">
          <label for="recheck_password">Confirmation du mot de passe:</label>
          <input
              type="password"
              id="recheck_password"
              v-model="form.recheck_password"
              required
              class="form-control"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Inscription...' : 'S\'inscrire' }}
          </button>
        </div>
      </form>

      <div class="login-link">
        Vous avez déjà un compte?
        <router-link to="/login">Se connecter</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',

  setup() {
    const store = useStore()
    const router = useRouter()

    const form = ref({
      email: '',
      username: '',
      password: '',
      recheck_password: ''
    })

    const error = ref('')
    const loading = ref(false)

    const onSubmit = async () => {
      error.value = ''

      // Validation côté client
      if (!form.value.email || !form.value.username || !form.value.password || !form.value.recheck_password) {
        error.value = 'Tous les champs sont obligatoires'
        return
      }

      if (form.value.password !== form.value.recheck_password) {
        error.value = 'Les mots de passe ne correspondent pas'
        return
      }

      loading.value = true

      try {
        console.log('Attempting registration with:', form.value)
        const success = await store.dispatch('auth/register', {
          email: form.value.email,
          username: form.value.username,
          password: form.value.password,
          recheck_password: form.value.recheck_password
        })

        console.log('Registration response:', success)
        if (success === true) {
          // Registration successful, redirect to inventory
          router.push('/inventory')
        } else {
          error.value = 'Une erreur est survenue lors de l\'inscription'
        }
      } catch (err) {
        console.error('Registration error details:', err)
        if (err.response) {
          console.error('Response data:', err.response.data)
          console.error('Response status:', err.response.status)
          error.value = err.response.data?.message || 'Une erreur est survenue lors de l\'inscription'
        } else {
          error.value = 'Une erreur est survenue lors de l\'inscription'
        }
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
.register-container {
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

.login-link {
  margin-top: 1rem;
  text-align: center;
}
</style>