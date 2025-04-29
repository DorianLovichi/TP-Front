<template>
  <form @submit.prevent="onSubmit" class="item-form">
    <div class="form-group">
      <label for="name">Nom:</label>
      <input
        type="text"
        id="name"
        v-model="form.name"
        required
        class="form-control"
      />
    </div>

    <div class="form-group">
      <label for="description">Description:</label>
      <textarea
        id="description"
        v-model="form.description"
        required
        class="form-control"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="quantity">Quantité:</label>
      <input
        type="number"
        id="quantity"
        v-model="form.quantity"
        required
        min="0"
        class="form-control"
      />
    </div>

    <div class="form-group">
      <label for="type">Type:</label>
      <select id="type" v-model="form.type" required class="form-control">
        <option value="weapon">Arme</option>
        <option value="armor">Armure</option>
        <option value="potion">Potion</option>
        <option value="misc">Divers</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer') }}
      </button>
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Annuler
      </button>
    </div>
  </form>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ItemForm',
  props: {
    item: {
      type: Object,
      default: () => ({
        name: '',
        description: '',
        quantity: 0,
        type: 'misc'
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const form = ref({ ...props.item })
    const loading = ref(false)

    onMounted(() => {
      if (props.isEdit) {
        form.value = { ...props.item }
      }
    })

    const onSubmit = async () => {
      loading.value = true
      try {
        emit('submit', { ...form.value })
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      onSubmit
    }
  }
}
</script>

<style scoped>
.item-form {
  max-width: 500px;
  margin: 0 auto;
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

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  flex: 1;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
